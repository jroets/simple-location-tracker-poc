import { Injectable } from '@angular/core';
import { Geolocation, WatchPositionCallback } from '@capacitor/geolocation';
import { AppStateMonitor } from './app-state-monitor.service';
import * as EventEmitter from 'events';

/** 
 * This is a singleton location watcher service. It encapsulates a single watcher. 
 * Consumers simply register a callback. They don't need to worry about getting
 * the watcher started, or restarted, or any other management of it.
 * 
 * The assumption is that we don't need multiple watchers.
 * 
 * @todo Notify callbacks of changes to watcher status (starting, running, stopped)
 * @todo Consider implementing as an observable instead of callbacks
 * @todo Make the location options configurable at the app level
 * @todo Find easier/better way to monitor foreground/background transition
 */
@Injectable({
  providedIn: 'root',
})
export class LocationWatcherService {
  private watcherId: string;
  private callbacks: Map<number, WatchPositionCallback>;
  private options: PositionOptions;
  private nextId: number;
  private emitter: EventEmitter;

  constructor(private appStateMonitor: AppStateMonitor) { 
    this.nextId = 1;
    this.callbacks = new Map();

    // Default location options
    this.options = {
      timeout: 10000,
      enableHighAccuracy: true,
      maximumAge: 3600
    }

    // Emitter for foreground/background events
    this.emitter = appStateMonitor.getEmitter();

    // We don't get ngOnInit in service, so make our own init
    this.init();
  }

  /** Initialize */
  private init(): void {
    // Start the (one and only) watcher
    this.startInternalWatcher();

    // We're going to restart whenever the app comes from the background
    // to deal with (what seems like) some quirks, like not detecting
    // a permission change.
    this.emitter.addListener("toForeground", this.onForeground.bind(this));
  }

  /** 
   * Tear down (angular will call this automatically)
   */
  ngOnDestroy() {
    // Stop the watcher if it's running
    this.stopInternalWatcher();
  }

  /** 
   * Register a fn to be called with location updates 
   * @param {WatchPositionCallback} callback - The callback fn
   * @returns {number} A unique id that can be used to deregister
   * @see deregister
   */
  register(callback: WatchPositionCallback): number {
    const id = this.getUniqueId();
    // Add the fn to the callbacks collection
    this.callbacks.set(id, callback);
    return id;
  }

  /** 
   * Remove a registered callback from the watcher
   * @param {number} id - The id of the callback that was provided in the registration
   * @see register
   */
  deregister(id: number): void {
    /** @todo Should we care about an unfound id? */
    this.callbacks.delete(id);
  }

  /** 
   * The callback that is called internally on location updates.
   * Forwards the location update to all registered callbacks.
   */
  private internalCallback(position: GeolocationPosition, err?: GeolocationPositionError): void {
    // Log a few things
    if (position) console.log("Reported position:", position.coords.latitude, position.coords.longitude);
    if (err) console.log("Reported Error (" + err.code + ") " + err.message);

    // Loop through and call each registered callback
    this.callbacks.forEach(callback => callback(position, err));
  }

  /** 
   * Generate a unique id, to be give to registrants.
   * @returns {number} The id
   */
  private getUniqueId(): number {
    return this.nextId++;
  }

  /** 
   * Method to start the watcher
   */
  private async startInternalWatcher() {
    console.log("Starting watcher");
    this.watcherId = await Geolocation.watchPosition(this.options, this.internalCallback.bind(this));
  }

  /** 
   * Method to stop the watcher
   */
  private async stopInternalWatcher() {
    if (this.watcherId) {
      console.log("Stopping watcher");
      await Geolocation.clearWatch({id: this.watcherId});
    }
  }

  /**
   * Method to restart (stop and start) the internal watcher
   */
  private async restartInternalWatcher() {
    await this.stopInternalWatcher();
    await this.startInternalWatcher();
  }

  /**
   * Callback to handle transition from background to foreground
   */
  private onForeground() {
    console.log("Restarting watcher on foreground");
    this.restartInternalWatcher();
  }
}
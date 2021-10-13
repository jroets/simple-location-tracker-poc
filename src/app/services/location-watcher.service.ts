import { Injectable } from '@angular/core';
import { Geolocation, WatchPositionCallback } from '@capacitor/geolocation';

/** 
 * This is a singleton location watcher service. It encapsulates a single watcher. 
 * Consumers simply register a callback. They don't need to worry about getting
 * the watcher started, or restarted, or any other management of it.
 * 
 * The assumption is that we don't need multiple watchers.
 */
@Injectable({
  providedIn: 'root',
})
export class LocationWatcherService {
  private watcherId: string;
  private callbacks: Map<number, WatchPositionCallback>;
  private options: PositionOptions;
  private nextId: number;

  constructor() { 
    this.nextId = 1;
    this.callbacks = new Map();

    /** @todo Make this configurable at the app level */
    this.options = {
      timeout: 10000,
      enableHighAccuracy: true,
      maximumAge: 3600
    }

    // We don't get ngOnInit in service, so make our own init
    this.init();
  }

  /** Initialize */
  private init(): void {
    // Start the (one and only) watcher
    this.startInternalWatcher();
  }

  /** Tear down (angular will call this automatically) */
  ngOnDestroy() {
    // Stop the watcher if it's running
    this.stopInternalWatcher();
  }

  /** Register a fn to be called with location updates 
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

  /** Remove a registered callback from the watcher
   * @param {number} id - The id of the callback that was provided in the registration
   * @see register
   */
  deregister(id: number): void {
    /** @todo Should we care about an unfound id? */
    this.callbacks.delete(id);
  }

  /** The callback that is called internally on location updates.
   * Forwards the location update to all registered callbacks.
   */
  private internalCallback(position: GeolocationPosition, err?: GeolocationPositionError): void {
    // Log a few things
    if (position) console.log("Reported position:", position.coords.latitude, position.coords.longitude);
    if (err) console.log("Reported Error:", err.message);

    // Loop through and call each registered callback
    this.callbacks.forEach(callback => callback(position, err));
  }

  /** Generate a unique id, to be give to registrants.
   * @returns {number} The id
   */
  private getUniqueId(): number {
    return this.nextId++;
  }

  /** Method to start the watcher */
  private async startInternalWatcher() {
    console.log("Starting watcher");
    this.watcherId = await Geolocation.watchPosition(this.options, this.internalCallback.bind(this));
  }

  /** Method to stop the watcher
   * @todo We need to notify callbacks if we stop the watcher
   */
  private async stopInternalWatcher() {
    if (this.watcherId) {
      console.log("Stopping watcher");
      await Geolocation.clearWatch({id: this.watcherId});
    }
  }
}
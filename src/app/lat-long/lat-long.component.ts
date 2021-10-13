import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LocationWatcherService } from '../services/location-watcher.service';
import { AppStateMonitor } from '../services/app-state-monitor.service';
import * as EventEmitter from 'events';

/**
 * This is the controller for the lat-long component.
 * @todo Replace toForeground monitor with watcher status events.
 * @todo iOS doesn't seem to set location error codes.
 * @todo android doesn't like direct ref to GeolocationPositionError.
 */

/**
 * Add a friendly message property to standard location error object
 */
interface LocationError extends GeolocationPositionError {
    friendlyMessage: string;
}

@Component({
  selector: 'lat-long',
  templateUrl: './lat-long.component.html',
  styleUrls: ['./lat-long.component.scss'],
})
export class LatLongComponent implements OnInit {

  // Mapping location error codes to friendly(er) messages
  private errorCodeToMessageMap: Map<number, string>;
  private fallbackErrorMessage: string;

  private position: GeolocationPosition;
  private error: LocationError;
  private watcherId: number;
  private emitter: EventEmitter;

  constructor(
    private locationWatcherService: LocationWatcherService,
    private cd: ChangeDetectorRef,
    private appStateMonitor: AppStateMonitor) {
    
    /**
     * @todo Android doesn't like this -- GeolocationPositionError is not defined??
     * Everybody else is ok with it.
     */
    //this.errorCodeToMessageMap = new Map([
    //  [GeolocationPositionError.POSITION_UNAVAILABLE, "Location permission denied"],
    //  [GeolocationPositionError.POSITION_UNAVAILABLE, "Location not currently available"],
    //  [GeolocationPositionError.TIMEOUT, "Timeout"]
    //]);
  
    /**
     * @todo See above
     */
    this.errorCodeToMessageMap = new Map([
      [1, "Location permission denied"],
      [2, "Location not currently available"],
      [3, "Timeout"]
    ]);
    this.fallbackErrorMessage = "Cannot retrieve location";

    // Emitter for foreground/background events
    this.emitter = appStateMonitor.getEmitter();
  }

  ngOnInit() {
    console.log("ngOnInit");

    this.start();

    // Avoid showing a stale location when the app comes to the foreground.
    this.emitter.addListener("toForeground", this.clear.bind(this));
  }

  ngOnDestroy() {
    this.stop();
  }

  /**
   * Start watching
   */
  start() {
    console.log("Start");
    this.clear();
    this.watcherId = this.locationWatcherService.register(this.onLocationUpdate.bind(this));
  }

  /** 
   * Stop watching
   */
  stop() {
    this.locationWatcherService.deregister(this.watcherId);
    delete this.watcherId;
  }

  /**
   * Clear the template-bound data
   */
  clear() {
    console.log("Clearing the bound data");
    delete this.error;
    delete this.position;
  }

  /** 
   * This is the registered fn to be called by the watcher on location updates.
   */
  onLocationUpdate(position: GeolocationPosition, err?: GeolocationPositionError) {
    // Store the new state so the template can update
    this.setError(err);
    this.setPosition(position);

    /** @todo For some reason android won't update without this (Samsung S7 at least) */
    console.log("Forcing change detection");
    this.cd.detectChanges();
  }

  /**
   * Error setter, map error code to a friendly message
   */
  setError(error: GeolocationPositionError) {
    //console.log("setError");
    delete this.error;
    if (error) {
      //console.log("Error code:", error.code);
      this.error = {
        ...error,
        friendlyMessage: this.errorCodeToMessageMap.get(error.code)
      }
      if (!this.error.friendlyMessage) {
        /** @todo iOS not setting error codes?? Its message is not user friendly */
        // this.error.friendlyMessage = error.message ? error.message : this.fallbackErrorMessage;
        this.error.friendlyMessage = this.fallbackErrorMessage;
      }
    }
  }

  /**
   * Position setter
   */
  setPosition(position: GeolocationPosition) {
    this.position = position;
  }
}
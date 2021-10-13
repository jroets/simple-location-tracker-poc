import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LocationWatcherService } from '../services/location-watcher.service';

// Add a friendly message property to standard location error object
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
  private errorCodeToMessageMap: Map<number, string> = new Map([
    [GeolocationPositionError.PERMISSION_DENIED, "Location permission denied"],
    [GeolocationPositionError.POSITION_UNAVAILABLE,  "Location not currently available"],
    [GeolocationPositionError.TIMEOUT, "Timeout"]
  ]);
  private fallbackErrorMessage: string = "Unknown location error";

  private position: GeolocationPosition;
  private error: LocationError;
  private watcherId: number;

  constructor(
    private locationWatcherService: LocationWatcherService,
    private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.start();
  }

  ngOnDestroy() {
    this.stop();
  }

  /**
   * Start watching
   */
  start() {
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
   * Clear the bound data
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
   * Error setter
   */
  setError(error: GeolocationPositionError) {
    delete this.error;
    if (error) {
      this.error = {
        ...error,
        friendlyMessage: this.errorCodeToMessageMap.get(error.code)
      }
      if (!this.error.friendlyMessage) this.error.friendlyMessage = this.fallbackErrorMessage;
    }
  }

  /**
   * Position setter
   */
  setPosition(position: GeolocationPosition) {
    this.position = position;
  }
}
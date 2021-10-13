import { Component, OnInit } from '@angular/core';
import { LocationWatcherService } from '../services/location-watcher.service';

@Component({
  selector: 'lat-long',
  templateUrl: './lat-long.component.html',
  styleUrls: ['./lat-long.component.scss'],
})
export class LatLongComponent implements OnInit {

  private position: GeolocationPosition;
  private error: GeolocationPositionError;
  private watcherId: number;

  constructor(
    private locationWatcherService: LocationWatcherService) {

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
    this.error = err;
    this.position = position;
  }
}
import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { EventEmitter } from 'events';

/**
 * This is a service that wraps the appStateChangeEvent, to turn it into either
 * a "toForeground" or "toBackground" event.
 * 
 * @todo This does not seem an elegant solution using the event emitter
 * @todo appStateChange seems to be fired repeatedly when location permission denied (android)
 */

@Injectable({
  providedIn: 'root',
})
export class AppStateMonitor {

  private isAppActive: boolean;
  private emitter: EventEmitter;

  constructor() { 
    this.isAppActive = true;
    this.emitter = new EventEmitter();

    // Add listener on appStateChange so we can detect background/foreground
    App.addListener('appStateChange', this.onAppStateChange.bind(this));
  }

  /**
   * Getter for the event emitter
   * @returns An event emitter
   */
  getEmitter(): EventEmitter {
    return this.emitter;
  }

  /**
   * Private method to handle appStateChange and then fire toForeground or
   * toBackground events.
   */
  private onAppStateChange({ isActive }) {
    // Set some bits so we can detect which state change we got
    const isNowActive = isActive;
    const wasActive = this.isAppActive;

    // Nothing to do if there wasn't actually a state change
    if (isNowActive === wasActive) return;

    // Save the new state
    this.isAppActive = isNowActive;

    // Did we come to the foreground or go to the background?
    const toForeground = isNowActive && !wasActive;
    //const toBackground = !isNowActive && wasActive;

    console.log("App State Change: " + ((toForeground) ? "active" : "inactive"));
    
    // Fire individual events for toForeground or toBackground
    this.emitter.emit((toForeground ? "toForeground" : "toBackground"));
  }
}
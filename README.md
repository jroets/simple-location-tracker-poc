# simple-location-tracker-poc

## Overview
A POC using Ionic/Angular &amp; Capacitor to demonstrate use of a Geolocation Watcher to display real-time latitude and longitude.

See [Ionic docs](https://ionicframework.com/docs/cli/commands/build) for how to build and run.

As this is a POC, it's not written to be production ready. It lacks unit tests, e2e tests, a pretty UI, etc; and the code probably contains undiscovered bugs. Please heed the list of known "implementation problems" below.

## What this POC technically demonstrates
* The app is based off of the Ionic Tabs starter template.
* The display of latitude/longitude is encapsulated in its own custom UI component.
  * With a very light template.
  * And a controller that sticks to its primary job (separation of concerns).
* Ionic UI web components are used as the basis for all UX.
* The app uses the Capacitor Geolocation Plugin and App Plugin.
* The geolocation plugin is abstracted away from the controller through an Angular service.
* The geolocation watcher itself is also abstracted away from the controller in the same service.
* An angular service was written to monitor the appStateChange event and convert to foreground/background events.
  * Similar concept to the Cordova OnPause and OnResume events.

## Possible next steps for the UX
* Plot movement on a map.
* Allow the user to invoke a help modal when there are location problems. E.g.
  * Permission denied.
  * Location Service turned off.
  * Poor connectivity.
  * iOS Precise Location is disabled (requires another plugin).
* Provide the user some control over the watcher: 
  * Stop/restart.
  * Enable/Disable high accuracy.
  * Set the timeout value.
  * Set the maximum age value.

## Current implementation "problems"
* iOS not reporting error codes when location cannot be retrieved.
* Angular change detection not automatically firing on android (webview).
* appStateChange event seems to fire repeatedly on android when location permission is denied.
* android thinks GeolocationPositionError is undefined in the location watcher service.
* The approach to the event emitter for background/foreground doesn't seem best practice.
* Real-time changes to location settings (e.g. permission on/off) not always detected.

## Next steps for the code
* Consider converting the watcher into an Observable
* Try to find a cross-platform way to detect changes to location permissions while the app is in use 
  * E.g. For web, see https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus
* Emit events from the watcher when its running state changes (starting, running, stopping)
* Review and possibly better implement the foreground/background event emitter service
* Eliminate the forced change detection
* Address the geolocation plugin on iOS not reporting error codes (always undefined)
* Address android (webview) thinking GeolocationPositionError is undefined in the controller
* Investigate the appStateChange event firing repeatedly on android when location permission denied

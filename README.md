# simple-location-tracker-poc
A POC using Ionic/Angular &amp; Capacitor to demonstrate use of a Geolocation Watcher to display real-time latitude and longitude.

This is a standard Capactor app built on a foundation of Ionic UI components and Angular. See Capacitor docs for how to run and build.

The app uses the Capacitor Geolocation Plugin.

Some details of what this POC technically demonstrates:
* The app is based off of the Ionic Tabs starter template.
* The display of latitude/longitude is encapsulated in its own custom UI component.
** With a very light template.
** And a controller that sticks to its primary job (separation of concerns).
* Ionic UI web components are used as the basis for all UX.
* The app uses the Capacitor Geolocation Plugin and App Plugin.
* The geolocation plugin is abstracted away from the controller through an Angular service.
* The geolocation watcher itself is also abstracted away from the controller in the same service.
* An angular service was written to monitor the appStateChange event and convert to foreground/background events.
** Similar concept to the Cordova OnPause and OnResume events.

Possible next steps for the UX:
* Plot movement on a map.
* Allow the user to invoke a help modal when there are location problems. E.g.
** Permission denied.
** Location Service turned off.
** Poor connectivity.
** iOS Precise Location is disabled (requires another plugin).
* Provide the user some control over the watcher: 
** Stop/restart.
** Enable/Disable high accuracy.
** Set the timeout value.
** Set the maximum age value.

Next steps for the code:
* Consider converting the watcher into an Observable...
** So that the code can be cleaner by getting rid of callbacks and watcher ids.
** and so that we can demonstrate a more modern technical approach.
* Try to find a cross-platform way to detect changes to location permissions while the app is in use.
** So that we can better inform the user of their current status.
** E.g. For web, see https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus
* Have the watcher emit events when its state changes (starting, running, stopping)
** So that the view can have the info at its disposal (e.g. to inform the user of things like "loading")
** So that we can get rid of the current approach that has the view monitor for appStateChange.
* Review and possibly better implement the foreground/background event emitter service.
** So that we don't have bad practices in the code.
* Eliminate the forced change detection.
** So that we don't have bad practices in the code.
* Figure out what is going on with the geolocation plugin on iOS not reporting error codes (always undefined).
** So that we can show a more specific message to the user on iOS.
* Figure out why android (webview) thinks GeolocationPositionError is undefined in the controller.
** So that we don't have bad practices in the code.
* Investigate the appStateChange event firing repeatedly on android when location permission denied.
** So that we can possibly

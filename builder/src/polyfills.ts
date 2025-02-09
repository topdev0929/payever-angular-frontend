/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
* BROWSER POLYFILLS
*/


/**
 * IE10 and IE11 requires the following for NgClass support on SVG elements
 */
import 'classlist.js';  // Run `npm install --save classlist.js`.

/** IE10 and IE11 requires the following for the Reflect API. */
// import 'core-js/es6/reflect';

/**
 * Evergreen browsers require these.
 */
// Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.
import 'core-js/es7/reflect';

/**
 * Required to support Web Animations `@angular/platform-browser/animations`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 */
import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.
// import 'zone.js/dist/zone-patch-rxjs';

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

//import 'pepjs/dist/pep';

declare var FastClick: any;
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
    FastClick.attach(document.body);
  }, false);
}

/***************************************************************************************************
 * TODO: remove this after full migration to angular 6. In v6 support of process and global variables in browser was removed.
 */
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined }
};

(function () {
  if (typeof (window as any).CustomEvent === "function") return false; //If not IE

  function CustomEvent(event: any, params: any) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = (window as any).Event.prototype;

  (window as any).CustomEvent = CustomEvent;
})();

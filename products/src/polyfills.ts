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
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
import 'classlist.js';  // Run `npm install --save classlist.js`.
import 'core-js/es6/reflect';
import 'core-js/es7/array'; // it adds 'includes' method for arrays
import 'core-js/es7/reflect';
import 'hammerjs/hammer';
import 'web-animations-js';  // Run `npm install --save web-animations-js`.
import 'zone.js/dist/zone';  // Included with Angular CLI.

/** IE10 and IE11 requires the following for the Reflect API. */

/**
 * Evergreen browsers require these.
 */
// Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.

/**
 * Required to support Web Animations `@angular/platform-browser/animations`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 */

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Fix bug with Uncaught ReferenceError: global is not defined
// @TODO need to investigate this problem
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};

/* tslint:disable */
(function () {
  if (typeof (window as any).CustomEvent === 'function') return false; //If not IE

  function CustomEvent(event: any, params: any) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    let evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = (window as any).Event.prototype;

  (window as any).CustomEvent = CustomEvent;

  // Polyfill for IE - .remove() method is not supported
  if (!('remove' in Element.prototype as any)) {
    Element.prototype['remove'] = function (): any {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }
})();

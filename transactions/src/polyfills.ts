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


/** IE10 and IE11 requires the following for NgClass support on SVG elements */
import 'classlist.js';  // Run `npm install --save classlist.js`.

/** Evergreen browsers require these. **/
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';


/**
 * Required to support Web Animations `@angular/animation`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.



/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
// We load zonejs from pe static repo, check cosf
// import 'zone.js/dist/zone';  // Included with Angular CLI.

// Needed on browsers with native `customElements`.
// (E.g.: Chrome, Opera)
import '@webcomponents/custom-elements/src/native-shim';

// Needed for browsers without native `customElements`.
// (E.g.: Edge, Firefox, IE, Safari)
import '@webcomponents/custom-elements/custom-elements.min';

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

(window as any).global = window;

(function () {
  if ( typeof (window as any).CustomEvent === "function" ) return false; //If not IE

  function CustomEvent ( event: any, params: any ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }

  CustomEvent.prototype = (window as any).Event.prototype;

  (window as any).CustomEvent = CustomEvent;

  // Polyfill for IE - .remove() method is not supported
  if (!('remove' in Element.prototype)) {
    Element.prototype['remove'] = function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    } as never;
  }

  if ( !Object.values ) {
    Object.values = function(obj: any) {
      return Object.keys(obj).map((key: string) => obj[key]);
    }
  }
})();

// preventing zoom on pinch
document.addEventListener(
  'touchmove',
  (event: any) => {
    event = event.originalEvent || event;
    if (event.scale && event.scale !== 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

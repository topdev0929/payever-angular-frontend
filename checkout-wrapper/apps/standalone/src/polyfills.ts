/** Evergreen browsers require these. **/

import '@angular/localize/init';
import 'zone.js';

(window as any).global = window;

// To avoid micro.js intersections
if (typeof Symbol === 'function' && !(Symbol as any).observable) {
  (Symbol as any).observable = Symbol('observable');
}

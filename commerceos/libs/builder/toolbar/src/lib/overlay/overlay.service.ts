import { Injectable } from '@angular/core';

import { PebOverlayTriggerDirective } from './overlay.directive';

@Injectable({ providedIn: 'root' })
export class PebOverlayService extends WeakMap<HTMLElement, PebOverlayTriggerDirective> {
}

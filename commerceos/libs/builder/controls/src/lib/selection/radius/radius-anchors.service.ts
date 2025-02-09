import { Injectable } from '@angular/core';
import RBush from 'rbush';

import { PeAnchorType } from '@pe/builder/events';


@Injectable({ providedIn: 'any' })
export class PebRadiusAnchorsService extends RBush<PeAnchorType> {
}

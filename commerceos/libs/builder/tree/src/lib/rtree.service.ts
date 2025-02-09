import { Injectable } from '@angular/core';
import RBush from 'rbush';

import { PebElement } from '@pe/builder/render-utils';


@Injectable()
export class PebDefRTree extends RBush<PebElement> {
}

import { InjectionToken } from '@angular/core';

import { storageFactory } from '../helpers';
import { StorageInterface } from '../interfaces';

export const BROWSER_STORAGE = new InjectionToken<StorageInterface>('Browser Storage', {
  providedIn: 'root',
  factory: storageFactory,
});

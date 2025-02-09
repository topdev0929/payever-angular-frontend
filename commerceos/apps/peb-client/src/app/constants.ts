import { InjectionToken } from '@angular/core';

import { PebClientBootstrapData } from '@pe/builder/core';

export const APP_DATA = new InjectionToken<PebClientBootstrapData>('Application data');
export const PEB_STATE_SCRIPT_TAG = '<script id="peb-state"></script>';

import { InjectionToken } from '@angular/core';

import { ErrorHandlerConfig } from '../models';

export const ERROR_HANDLER_CONFIG = new InjectionToken<ErrorHandlerConfig>('ERROR_HANDLER_CONFIG');

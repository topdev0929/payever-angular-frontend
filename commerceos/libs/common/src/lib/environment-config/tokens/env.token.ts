import { InjectionToken } from '@angular/core';

import { EnvironmentConfigInterface } from '../interfaces/environment-config.interface';

export const PE_ENV = new InjectionToken<EnvironmentConfigInterface>('PE_ENV');
export const PE_MEDIA_API_PATH = new InjectionToken<string>('PE_MEDIA_API_PATH');

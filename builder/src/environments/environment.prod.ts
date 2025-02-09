import { EnvironmentInterface } from '../interfaces/environment.interface';

export const environment: EnvironmentInterface = {
  production: true,
  i18nPath: 'https://translation-backend.devpayever.com/json/',
  i18nVersion: 1.6,
  builderAssetsPath: '/assets',
  clientAssetsPath: '/assets',
  ngrx_logger: false,
};

import { StorageService } from '@pe/checkout/storage';

export const appVersionFactory = (storageService: StorageService) => () => {
  const key = 'app_version';
  if (storageService.get(key) !== 'MICRO_CHECKOUT_VERSION') {
    storageService.clear();
    storageService.set(key, 'MICRO_CHECKOUT_VERSION');
  }
};

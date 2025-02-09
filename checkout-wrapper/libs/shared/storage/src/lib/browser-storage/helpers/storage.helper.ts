import { StorageInterface } from '../interfaces';
import { InMemoryStorageStrategy } from '../strategy';

export function storageFactory(): StorageInterface {
  return navigator.cookieEnabled ? localStorage : new InMemoryStorageStrategy();
}

import { AddressItem } from '../models';

export function addressMask(item: AddressItem | string): string {
  const address = typeof item === 'string' ? item : item?.address;

  return !item ? '' : address;
}

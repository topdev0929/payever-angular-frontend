import { v4 as uuid } from 'uuid';

export function pebGenerateId(): string {
  return uuid();
}

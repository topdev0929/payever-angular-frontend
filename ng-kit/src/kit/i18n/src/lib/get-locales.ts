import { LocalesConfigInterface } from '../interfaces';

export function getLangList(): LocalesConfigInterface {
  // tslint:disable-next-line no-var-requires
  return require('../../../../../config/lang-list');
}

import { getI18nPath } from './get-i18n-path';
import { DEFAULT_PROD_I18N_PATH, DEFAULT_DEV_I18N_PATH } from '../constants';

describe('getI18nPath', () => {
  it('should return proper value', () => {
    expect(getI18nPath({}, true)).toBe(DEFAULT_PROD_I18N_PATH);
    expect(getI18nPath({}, false)).toBe(DEFAULT_DEV_I18N_PATH);

    const config: any = {
      i18nPath: DEFAULT_DEV_I18N_PATH
    };

    expect(getI18nPath(config, true)).toBe(DEFAULT_DEV_I18N_PATH);
  });
});

import { TranslationLoaderStubService } from '../../../../i18n';

describe('TranslationLoaderStubService', () => {
  let stub: TranslationLoaderStubService;

  it('should save passed values as last values', () => {
    stub = new TranslationLoaderStubService();

    const i18nDomains: string[] = ['[test-I18nKey]'];

    expect(stub.lastI18nDomains).toBeUndefined();

    stub.loadTranslations(i18nDomains);
    expect(stub.lastI18nDomains).toBe(i18nDomains);
  });

  it('should return response which has been defined on stub', async () => {
    const i18nDomains: string[] = ['[test-I18nKey]'];

    let result: boolean;
    stub = new TranslationLoaderStubService();

    result = await stub.loadTranslations(i18nDomains).toPromise();
    expect(result).toBe(stub.nextResponse);

    stub.nextResponse = true;
    result = await stub.loadTranslations(i18nDomains).toPromise();
    expect(result).toBe(stub.nextResponse);

    stub.nextResponse = false;
    result = await stub.loadTranslations(i18nDomains).toPromise();
    expect(result).toBe(stub.nextResponse);
  });
});

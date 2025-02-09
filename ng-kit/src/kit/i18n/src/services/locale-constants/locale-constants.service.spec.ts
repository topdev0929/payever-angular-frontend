import { LocaleConstantsService } from './locale-constants.service';
import * as utils from '../../lib';

describe('LocaleConstantsService', () => {

  let localeConstantsService: LocaleConstantsService;

  beforeEach(() => {
    localeConstantsService = new LocaleConstantsService({});
  });

  it('getLang should call getLang', () => {
    const getLangSpy: jasmine.Spy = jasmine.createSpy('getLangSpy');
    spyOnProperty(utils, 'getLang').and.returnValue(getLangSpy);
    localeConstantsService.getLang();

    expect(getLangSpy).toHaveBeenCalled();
  });

  it('getLocaleId should call getLocaleId', () => {
    const getLangSpy: jasmine.Spy = jasmine.createSpy('getLangSpy');
    spyOnProperty(utils, 'getLang').and.returnValue(getLangSpy);
    localeConstantsService.getLocaleId();

    expect(getLangSpy).toHaveBeenCalled();
  });

  it('getLocales should call getLangList', () => {
    const getLangListSpy: jasmine.Spy = jasmine.createSpy('getLangListSpy');
    spyOnProperty(utils, 'getLangList').and.returnValue(getLangListSpy);
    localeConstantsService.getLocales();

    expect(getLangListSpy).toHaveBeenCalled();
  });

  it('getCountryList should call getCountryList', () => {
    const localeId: string = 'id';
    const getCountryListSpy: jasmine.Spy = jasmine.createSpy('getCountryListSpy');
    spyOnProperty(utils, 'getCountryList').and.returnValue(getCountryListSpy);
    localeConstantsService.getCountryList(localeId);

    expect(getCountryListSpy).toHaveBeenCalledWith(localeId);
  });

  it('getContinentList should call getContinentList', () => {
    const getContinentListSpy: jasmine.Spy = jasmine.createSpy('getContinentListSpy');
    spyOnProperty(utils, 'getContinentList').and.returnValue(getContinentListSpy);
    localeConstantsService.getContinentList();

    expect(getContinentListSpy).toHaveBeenCalled();
  });

  it('getCountryContinentList should call getCountryContinentList', () => {
    const getCountryContinentListSpy: jasmine.Spy = jasmine.createSpy('getCountryContinentListSpy');
    spyOnProperty(utils, 'getCountryContinentList').and.returnValue(getCountryContinentListSpy);
    localeConstantsService.getCountryContinentList();

    expect(getCountryContinentListSpy).toHaveBeenCalled();
  });

  it('getDateFormatShort should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getDateFormatShortSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getDateFormatShort').and.returnValue(getDateFormatShortSpy);
    localeConstantsService.getDateFormatShort();

    expect(getDateFormatShortSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });

  it('getDateFormatShortMoment should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getDateFormatShortMomentSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getDateFormatShortMoment').and.returnValue(getDateFormatShortMomentSpy);
    localeConstantsService.getDateFormatShortMoment();

    expect(getDateFormatShortMomentSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });

  it('getDateMonthFormatShort should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getDateMonthFormatShortSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getDateMonthFormatShort').and.returnValue(getDateMonthFormatShortSpy);
    localeConstantsService.getDateMonthFormatShort();

    expect(getDateMonthFormatShortSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });

  it('getDateMonthFormatShortMoment should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getDateMonthFormatShortMomentSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getDateMonthFormatShortMoment').and.returnValue(getDateMonthFormatShortMomentSpy);
    localeConstantsService.getDateMonthFormatShortMoment();

    expect(getDateMonthFormatShortMomentSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });

  it('getDateLongFormatMoment should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getDateLongFormatMomentSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getDateLongFormatMoment').and.returnValue(getDateLongFormatMomentSpy);
    localeConstantsService.getDateLongFormatMoment();

    expect(getDateLongFormatMomentSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });

  it('getDateTimeFormat should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getDateTimeFormatSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getDateTimeFormat').and.returnValue(getDateTimeFormatSpy);
    localeConstantsService.getDateTimeFormat();

    expect(getDateTimeFormatSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });

  it('getThousandsSeparatorSymbol should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getThousandsSeparatorSymbolSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getThousandsSeparatorSymbol').and.returnValue(getThousandsSeparatorSymbolSpy);
    localeConstantsService.getThousandsSeparatorSymbol();

    expect(getThousandsSeparatorSymbolSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });

  it('getDecimalSymbol should call getLocales and getLang', () => {
    const getLocalesSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLocales').and.stub();
    const getLangsSpy: jasmine.Spy = spyOn(localeConstantsService, 'getLang').and.stub();
    const getDecimalSymbolSpy: jasmine.Spy = jasmine.createSpy();
    spyOnProperty(utils, 'getDecimalSymbol').and.returnValue(getDecimalSymbolSpy);
    localeConstantsService.getDecimalSymbol();

    expect(getDecimalSymbolSpy).toHaveBeenCalled();
    expect(getLocalesSpy).toHaveBeenCalled();
    expect(getLangsSpy).toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { LocaleConstantsService } from '../../services/locale-constants/locale-constants.service';
import { CurrencyPipe } from './currency.pipe';

describe('CurrencyPipe', () => {

  let pipe: any;
  let localeConstantsService: LocaleConstantsService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        CurrencyPipe,
        {
          provide: LocaleConstantsService,
          useValue: {
            getLocaleId: jasmine.createSpy().and.returnValue('en')
          }
        }
      ]
    });

    pipe = TestBed.get(CurrencyPipe);
    localeConstantsService = TestBed.get(LocaleConstantsService);
  });

  it('transform should call localeConstantsService getLocaleId and transform', () => {
    expect(pipe.transform(10000, '$', true, '1.2-2')).toBe('$10,000.00');
    expect(localeConstantsService.getLocaleId).toHaveBeenCalled();
  });
});

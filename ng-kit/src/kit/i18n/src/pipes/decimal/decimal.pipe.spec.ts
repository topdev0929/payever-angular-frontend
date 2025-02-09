import { TestBed } from '@angular/core/testing';
import { LocaleConstantsService } from '../../services/locale-constants/locale-constants.service';
import { DecimalPipe } from './decimal.pipe';

describe('DecimalPipe', () => {

  let pipe: DecimalPipe;
  let localeConstantsService: LocaleConstantsService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        DecimalPipe,
        {
          provide: LocaleConstantsService,
          useValue: {
            getLocaleId: jasmine.createSpy().and.returnValue('en')
          }
        }
      ]
    });

    pipe = TestBed.get(DecimalPipe);
    localeConstantsService = TestBed.get(LocaleConstantsService);
  });

  it('transform should call localeConstantsService getLocaleId and transform', () => {
    expect(pipe.transform(10000, '1.2-2')).toBe('10,000.00');
    expect(localeConstantsService.getLocaleId).toHaveBeenCalled();
  });
});

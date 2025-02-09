import { TestBed } from '@angular/core/testing';
import { LocaleConstantsService } from '../../services/locale-constants/locale-constants.service';
import { PercentPipe } from './percent.pipe';

describe('PercentPipe', () => {

  let pipe: PercentPipe;
  let localeConstantsService: LocaleConstantsService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        PercentPipe,
        {
          provide: LocaleConstantsService,
          useValue: {
            getLocaleId: jasmine.createSpy().and.returnValue('en')
          }
        }
      ]
    });

    pipe = TestBed.get(PercentPipe);
    localeConstantsService = TestBed.get(LocaleConstantsService);
  });

  it('transform should call localeConstantsService getLocaleId and transform', () => {
    expect(pipe.transform(100, '1.1-1')).toBe('10,000.0%');
    expect(localeConstantsService.getLocaleId).toHaveBeenCalled();
  });
});

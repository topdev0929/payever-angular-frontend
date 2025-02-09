import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { tap } from 'rxjs/operators';

import { UtilStepService } from './utils-steps.service';


describe('UtilStepService', () => {
  let instance: UtilStepService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
      ],
      providers: [
        UtilStepService,
      ],
    });
    instance = TestBed.inject(UtilStepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('getYesNoOptions', () => {
    it('Should return valid object', () => {
      const result = instance.getYesNoOptions();
      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(2);
      expect(result).toMatchObject([{ value: false }, { value: true }]);
    });
  });

  describe('translateOptions', () => {
    it('should return unique values from KeysPoll', () => {
      const result = instance.translateOptions(
        [
          ...Array.from({ length: 5 }, (_, i) => ({ label: 'a', value: i })),
          ...Array.from({ length: 5 }, (_, i) => ({ label: 'b', value: i })),
          ...Array.from({ length: 5 }, (_, i) => ({ label: 'a', value: i.toString() })),
          ...Array.from({ length: 5 }, (_, i) => ({ label: 'a', value: i.toString() })),
        ],
        {},
      );
      expect(result).toHaveLength(10);
    });

    it('should map values using KeysPoll', () => {
      const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];
      const result = instance.translateOptions(
        Array.from({ length: 3 }, (_, i) => ({ label: 'a', value: i.toString() })),
        Object.fromEntries(alphabet.map((v, i) => [i.toString(), v])),
      );
      expect(result).toEqual(alphabet.slice(0, 3).map((v, i) => ({ label: v, value: i.toString() })));
    });
  });


  describe('getCountries', () => {
    it('Should fill labels from localeConstantsService using value - withEmpty', (done) => {
      instance.getCountries(true, {
        countryCodes: [
          { label: '0', value: 'UA' },
          { label: '0', value: 'US' },
          { label: '0', value: 'DE' },
          { label: '0', value: 'SE' },
        ],
        employmentType: [],
        repaymentSource: [],
        accommodationType: [],
      }).pipe(
        tap((result) => {
          expect(result).toEqual(
            [
              {
                'label': '',
                'value': null,
              },
              {
                'label': 'Sweden',
                'value': 'SE',
              },
              {
                'label': 'Ukraine',
                'value': 'UA',
              },
              {
                'label': 'United States of America',
                'value': 'US',
              },
              {
                'label': 'Germany',
                'value': 'DE',
              },
            ]
          );
          done();
        })
      ).subscribe();
    });

    it('Should fill labels from localeConstantsService using value', (done) => {
      instance.getCountries(false, {
        countryCodes: [
          { label: '0', value: 'UA' },
          { label: '0', value: 'US' },
          { label: '0', value: 'DE' },
          { label: '0', value: 'SE' },
        ],
        employmentType: [],
        repaymentSource: [],
        accommodationType: [],
      }).pipe(
        tap((result) => {
          expect(result).toEqual(
            [
              {
                'label': 'Sweden',
                'value': 'SE',
              },
              {
                'label': 'Ukraine',
                'value': 'UA',
              },
              {
                'label': 'United States of America',
                'value': 'US',
              },
              {
                'label': 'Germany',
                'value': 'DE',
              },
            ]
          );
          done();
        })
      ).subscribe();
    });
  });
});
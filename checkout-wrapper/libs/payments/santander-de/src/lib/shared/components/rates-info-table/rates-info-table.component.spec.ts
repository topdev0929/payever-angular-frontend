import { CurrencyPipe, registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';

import { currencyFixture, formOptionsInstallmentFixture, localeFixture, rateFixture } from '../../../test/fixtures';

import { RatesInfoTableComponent } from './rates-info-table.component';


describe('RatesInfoTableComponent', () => {
  let component: RatesInfoTableComponent;
  let fixture: ComponentFixture<RatesInfoTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        PeCurrencyPipe,
        {
          provide: LocaleConstantsService,
          useValue: {
            getLang: jest.fn().mockReturnValue('de-DE'),
          },
        },
        CurrencyPipe,
      ],
      declarations: [
        PeCurrencyPipe,
        RatesInfoTableComponent,
      ],
    }).compileComponents();
    registerLocaleData(de.default);
    fixture = TestBed.createComponent(RatesInfoTableComponent);
    component = fixture.componentInstance;
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Component', () => {
    const currency: string = currencyFixture();
    let currencyPipe: CurrencyPipe;

    beforeEach(() => {
      currencyPipe = new CurrencyPipe(localeFixture());

      component.rate = rateFixture();
      component.currency = currency;
      component.formOptions = formOptionsInstallmentFixture;
      fixture.detectChanges();
    });

    it('Should render rate.monthly_rate field', () => {
      const itemValue: DebugElement = fixture.debugElement.query(
        By.css('.monthly-rate .text-primary'),
      );
      expect(itemValue).not.toBeNull();
      expect(itemValue.nativeElement.textContent).toBe(
        currencyPipe.transform(rateFixture().monthlyPayment, currency),
      );

      const itemLabel: DebugElement = fixture.debugElement.query(
        By.css('.monthly-rate .text-secondary'),
      );
      expect(itemLabel).not.toBeNull();
      expect(itemLabel.nativeElement.textContent?.trim()).toBe('santander-de.credit_rates.monthly_rate');
    });

    describe('translations', () => {
      it('should durationLabel return months', () => {
        component.rate = {
          ...component.rate,
          duration: 2,
        };
        expect(component.durationLabel).toEqual($localize`:@@santander-de.credit_rates.months:`);
      });
      it('should durationLabel return month', () => {
        component.rate = {
          ...component.rate,
          duration: 1,
        };
        expect(component.durationLabel).toEqual($localize`:@@santander-de.credit_rates.month:`);
      });
      it('should cpi return yes', () => {
        component.data = {
          ...component.data,
          formRatesCheckboxes1: {
            ...component.data.formRatesCheckboxes1,
            credit_protection_insurance: true,
          },
        };
        expect(component.cpi).toEqual($localize`:@@ng_kit.forms.labels.yes:`);
      });
      it('should cpi return no', () => {
        component.data = {
          ...component.data,
          formRatesCheckboxes1: {
            ...component.data.formRatesCheckboxes1,
            credit_protection_insurance: false,
          },
        };
        expect(component.cpi).toEqual($localize`:@@ng_kit.forms.labels.no:`);
      });
    });

  });
});

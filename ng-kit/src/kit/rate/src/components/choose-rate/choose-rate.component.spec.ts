import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChooseRateComponent } from './choose-rate.component';
import { Subject } from 'rxjs';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { MatCardModule } from '@angular/material/card';
import { RateModule } from '../../../';
import { LANG, TranslateService, TranslateStubService } from '../../../../i18n';

describe('ChooseRateComponent', () => {
  let component: ChooseRateComponent;
  let fixture: ComponentFixture<ChooseRateComponent>;
  const initialRateId = '1';
  const stubRates = [{
    id: '1',
    lines: ['Total credit <span>€1000</span>'],
    title: '<span>€100</span>/mo. for 1 months'
  },
  {
    id: '2',
    lines: ['Total credit <span>€2000</span>'],
    title: '<span>€200</span>/mo. for 2 months'
  },
  {
    id: '3',
    lines: ['Total credit <span>€3000</span>'],
    title: '<span>€300.</span>/mo. for 3 months'
  }];

  nonRecompilableTestModuleHelper({
    imports: [
      MatCardModule,
      RateModule,
      BrowserAnimationsModule
    ],
    providers: [
      {
        provide: LANG,
        useValue: 'en'
      },
      {
        provide: TranslateService, useValue: new TranslateStubService()
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseRateComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('Should create component instance', () => {
    expect(component).toBeTruthy('fail with initialize component');
  });

  it('Should init view', () => {
    spyOn(component, 'ngOnInit');
    fixture.detectChanges();
    expect(component).toBeTruthy('fail with initialize component');
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(component.rates).toBeNull('empty rates should be null');
    expect(component.selectedRate).toBeNull('selected rate should be null if rates are empty');
  });

  describe('@inputs rates InitialRateId', () => {
    it('Should set rates and InitialRateId', () => {
      component.rates = stubRates;
      component.initialRateId = initialRateId;
      fixture.detectChanges();
      const initialRate = stubRates.find(item => item.id === initialRateId);
      const renderedInitialRateDesc = fixture.nativeElement.querySelector('.rate-description').innerHTML;
      const renderedInitialRateLine = fixture.nativeElement.querySelector('.rate-line').innerHTML;
      expect(component.selectedRate).toEqual(initialRate, '@input for initialRateId and selected rate not equal');
      expect(initialRate.title).toBe(renderedInitialRateDesc);
      expect(initialRate.lines[0]).toBe(renderedInitialRateLine);
    });
  });

  describe('chooseRate()', () => {
    it('Should change choosed rate', () => {
      component.rates = stubRates;
      component.initialRateId = initialRateId;
      fixture.detectChanges();
      component.chooseRate(stubRates[1]);
      expect(component.selectedRate).toEqual(stubRates[1]);
    });
  });

  describe('@input doSelectRate Subject', () => {
    it('Should change choosed rate by emit subject with rate id', () => {
      component.doSelectRate = new Subject<string>();
      component.rates = stubRates;
      component.initialRateId = initialRateId;
      fixture.detectChanges();
      const rateIdToSet = '2';
      component.doSelectRate.next(rateIdToSet);
      expect(component.selectedRate).toEqual(stubRates.find(item => item.id === rateIdToSet), 'changed rate not equal to emitted rate');
    });
  });

  describe('openRatesDropdown()', () => {
    it('Should open dropdown', () => {
      component.doSelectRate = new Subject<string>();
      component.rates = stubRates;
      component.initialRateId = initialRateId;
      expect(document.querySelector('.rates-dropdown')).toBeNull('fail with opening opened dropdown');
      component.openRatesDropdown();
      fixture.detectChanges();
      expect(document.querySelector('.rates-dropdown')).toBeTruthy();
    });

    it('Should render option in dropdown equal with rates @input', () => {
      component.doSelectRate = new Subject<string>();
      component.rates = stubRates;
      component.initialRateId = initialRateId;
      component.openRatesDropdown();
      fixture.detectChanges();
      let matOptions = Array.from(document.querySelectorAll('.rates-dropdown-option div'));
      expect(component.rates.length).toBe(matOptions.length);
      matOptions.forEach((item, index) => {
        expect(item.innerHTML).toBe(component.rates[index].title, 'rates.title not equal with rendered');
      });
    });
  });

  describe('@input isLoading', () => {
    it('Should set loading', () => {
      component.setIsLoading = true;
      expect(component.isLoading).toBeTruthy('isLoading should be true');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.loader_48')).toBeTruthy('loader with class "loader_48" not appended');
    });
  });
});

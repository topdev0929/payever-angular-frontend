import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { ratesFixture } from '../../../../../../test/fixtures';
import { RateModule } from '../../../rate.module';

import { CCP_MIN_INITIAL_RATE, CcpRateComponent } from './ccp-rate.component';

describe('CcpRateComponent', () => {

  let component: CcpRateComponent;
  let fixture: ComponentFixture<CcpRateComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(RateModule),
      ],
      declarations: [
        CcpRateComponent,
      ],
      schemas: [],
    }).compileComponents();


    fixture = TestBed.createComponent(CcpRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.currencyCode = 'EUR';
    component.rates = ratesFixture();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();

  });

  it('should set rates update rate and emit duration', () => {

    const SelectedEmit = jest.spyOn(component.selected, 'emit');

    component.rates = ratesFixture();
    expect(component['_rates']).toEqual(ratesFixture());
    expect(SelectedEmit).toHaveBeenCalledWith(String(ratesFixture()[0].duration));

  });

  it('should return first rate', () => {

    expect(component.rate).toEqual(ratesFixture()[0]);

  });

  it('should title transform correct minRate', () => {

    const currencyPipeTransform = jest.spyOn((component as any), 'currencyPipeTransform')
      .mockImplementation(value => value);

    expect(component.title).toEqual($localize`:@@payment-santander-de-pos.creditRates.ccpRate.title:${CCP_MIN_INITIAL_RATE}:rate:`);
    expect(currencyPipeTransform).toHaveBeenCalledWith(CCP_MIN_INITIAL_RATE);

  });

  it('should currencyPipeTransform return correct span', () => {

    const value = 100;
    const expectedValue = `transformed__${value}`;
    const expectedSpan = `<span>${expectedValue}</span>`;

    const currencyPipeTransformSpy = jest.spyOn(component['currencyPipe'], 'transform')
      .mockReturnValue(expectedValue);

    expect(component['currencyPipeTransform'](100)).toEqual(expectedSpan);
    expect(currencyPipeTransformSpy).toHaveBeenCalledWith(value, 'EUR', 'symbol', '1.2-2');

  });

  describe('description', () => {
    it('should get description', () => {
      const numMonths = 10;
      jest.spyOn(component, 'numMonths', 'get').mockReturnValue(numMonths);
      const expectedNumMonthsString = `<b>${numMonths}</b>`;
      expect(component.description).toEqual($localize`:@@payment-santander-de-pos.creditRates.ccpRate.description:${expectedNumMonthsString}:months:`);
    });

    it('should get description null', () => {
      jest.spyOn(component, 'numMonths', 'get').mockReturnValue(null);
      expect(component.description).toBeNull();
    });
  });

  describe('numMonths', () => {
    it('should return 0 if condition description is not defined', () => {
      expect(component.numMonths).toBe(0);
    });

    it('should return 0 if condition description does not match the pattern', () => {
      component.condition = { description: 'Some random description' } as any;
      expect(component.numMonths).toBe(0);
    });

    it('should return the number of months parsed from the condition description', () => {
      component.condition = { description: '0% 5M' } as any;
      expect(component.numMonths).toBe(5);
    });
  });

});

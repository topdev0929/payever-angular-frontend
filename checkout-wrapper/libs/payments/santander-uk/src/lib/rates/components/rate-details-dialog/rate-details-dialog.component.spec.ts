import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PluginEventsService } from '@pe/checkout/plugins';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../../test';

import { RateDetailsDialogComponent } from './rate-details-dialog.component';

describe('RateDetailsDialogComponent', () => {

  let component: RateDetailsDialogComponent;
  let fixture: ComponentFixture<RateDetailsDialogComponent>;

  let pluginEventsService: PluginEventsService;

  const matDialogData = {
    ...flowWithPaymentOptionsFixture(),
    flowId: flowWithPaymentOptionsFixture().id,
    rate: ratesFixture()[0],
  };
  const baseDate = new Date(Date.UTC(2023, 10, 23));
  const expectedDate = '23.11.2023';

  beforeEach(() => {


    TestBed.configureTestingModule({
      declarations: [RateDetailsDialogComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PluginEventsService,
        { provide: MAT_DIALOG_DATA, useValue: matDialogData },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RateDetailsDialogComponent);
    component = fixture.componentInstance;

    pluginEventsService = TestBed.inject(PluginEventsService);
    jest.spyOn(global, 'Date').mockReturnValue(baseDate);
    jest.spyOn(component['currencyPipe'], 'transform').mockReturnValue(null);
    jest.spyOn(component['percentPipe'], 'transform').mockReturnValue(null);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should emitModalShow on component init', () => {

    const emitModalShowSpy = jest.spyOn(pluginEventsService, 'emitModalShow');

    component.ngOnInit();

    expect(emitModalShowSpy).toHaveBeenCalledWith(matDialogData.flowId);

  });

  it('should init context on component init', () => {

    const initContextsSpy = jest.spyOn((component as any), 'initContexts');

    component.ngOnInit();

    expect(initContextsSpy).toHaveBeenCalled();

  });

  it('should todayAsStr return correct value', () => {

    expect(component.todayAsStr).toEqual(expectedDate);

  });

  it('should return translations', () => {

    const expectedValue = {
      months: $localize`:@@payment-santander-uk.credit_rates.months:`,
      note1: $localize`:@@payment-santander-uk.inquiry.note1:${matDialogData.businessName}:businessName:`,
      note2: $localize`:@@payment-santander-uk.inquiry.note2:${component.todayAsStr}:today:`,
    };

    expect(component.translations).toEqual(expectedValue);

  });

  it('should initContexts call correctly pipes', () => {

    const currencyPipeSpy = jest.spyOn(component['currencyPipe'], 'transform');
    const percentPipeSpy = jest.spyOn(component['percentPipe'], 'transform');

    component['initContexts']();

    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(1, matDialogData.total, matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(2, matDialogData.rate.amount, matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(3, matDialogData.rate.monthlyPayment, matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(4, matDialogData.rate.specificData.downPayment, matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(5, matDialogData.rate.amount - matDialogData.rate.specificData.downPayment,
        matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(6, matDialogData.rate.interest, matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(7, matDialogData.rate.totalCreditCost, matDialogData.currency);

    expect(percentPipeSpy)
      .toHaveBeenNthCalledWith(1, matDialogData.rate.specificData.flatRate / 100, '1.0-2');
    expect(percentPipeSpy)
      .toHaveBeenNthCalledWith(2, matDialogData.rate.interestRate / 100, '1.0-2');
  });

  it('should initContexts handle branch', () => {

    const branchMatDialogData: any = {
      ...matDialogData,
      rate: {
        ...matDialogData.rate,
        specificData: {
          ...matDialogData.rate.specificData,
          downPayment: undefined,
        },
      },
    };

    const currencyPipeSpy = jest.spyOn(component['currencyPipe'], 'transform');
    const percentPipeSpy = jest.spyOn(component['percentPipe'], 'transform');
    component.data = branchMatDialogData;

    component['initContexts']();

    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(1, branchMatDialogData.total, branchMatDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(2, branchMatDialogData.rate.amount, branchMatDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(3, branchMatDialogData.rate.monthlyPayment, branchMatDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(4, 0, matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(5, branchMatDialogData.rate.amount,
        matDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(6, branchMatDialogData.rate.interest, branchMatDialogData.currency);
    expect(currencyPipeSpy)
      .toHaveBeenNthCalledWith(7, branchMatDialogData.rate.totalCreditCost, branchMatDialogData.currency);

    expect(percentPipeSpy)
      .toHaveBeenNthCalledWith(1, branchMatDialogData.rate.specificData.flatRate / 100, '1.0-2');
    expect(percentPipeSpy)
      .toHaveBeenNthCalledWith(2, branchMatDialogData.rate.interestRate / 100, '1.0-2');
  });

});

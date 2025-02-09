import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper, FinishProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { FinishComponent } from './finish.component';



describe('FinishComponent', () => {

  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        FinishComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(FinishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should isStatusSuccess return true', () => {

    component.payment = { status: PaymentStatusEnum.STATUS_ACCEPTED };

    fixture.detectChanges();

    expect(component.payment.status).toEqual(PaymentStatusEnum.STATUS_ACCEPTED);
    expect(component.isStatusSuccess()).toBeTruthy();
    expect(component.isStatusPending()).toBeFalsy();
    expect(component.isStatusFail()).toBeFalsy();

    component.payment = { status: PaymentStatusEnum.STATUS_PAID };

    fixture.detectChanges();

    expect(component.payment.status).toEqual(PaymentStatusEnum.STATUS_PAID);
    expect(component.isStatusSuccess()).toBeTruthy();
    expect(component.isStatusPending()).toBeFalsy();
    expect(component.isStatusFail()).toBeFalsy();

  });

  it('should isStatusPending return true', () => {

    component.payment = { status: PaymentStatusEnum.STATUS_NEW };

    fixture.detectChanges();

    expect(component.payment.status).toEqual(PaymentStatusEnum.STATUS_NEW);
    expect(component.isStatusSuccess()).toBeFalsy();
    expect(component.isStatusPending()).toBeTruthy();
    expect(component.isStatusFail()).toBeFalsy();

    component.payment = { status: PaymentStatusEnum.STATUS_IN_PROCESS };

    fixture.detectChanges();

    expect(component.payment.status).toEqual(PaymentStatusEnum.STATUS_IN_PROCESS);
    expect(component.isStatusSuccess()).toBeFalsy();
    expect(component.isStatusPending()).toBeTruthy();
    expect(component.isStatusFail()).toBeFalsy();

  });

  it('should isStatusFail return true', () => {

    component.payment = { status: PaymentStatusEnum.STATUS_FAILED };

    fixture.detectChanges();

    expect(component.payment.status).toEqual(PaymentStatusEnum.STATUS_FAILED);
    expect(component.isStatusSuccess()).toBeFalsy();
    expect(component.isStatusPending()).toBeFalsy();
    expect(component.isStatusFail()).toBeTruthy();

    component.payment = { status: PaymentStatusEnum.STATUS_DECLINED };

    fixture.detectChanges();

    expect(component.payment.status).toEqual(PaymentStatusEnum.STATUS_DECLINED);
    expect(component.isStatusSuccess()).toBeFalsy();
    expect(component.isStatusPending()).toBeFalsy();
    expect(component.isStatusFail()).toBeTruthy();

  });

});

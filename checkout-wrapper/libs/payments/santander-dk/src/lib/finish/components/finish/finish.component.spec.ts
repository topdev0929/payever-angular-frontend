import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { FinishComponent } from './finish.component';

describe('FinishComponent', () => {

  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;

  const signingLink = 'https://payever-signing-link.com';
  const successLink = 'https://payever-success-link.com';

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FinishComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FinishComponent);
    component = fixture.componentInstance;

    window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        href: null,
      },
      writable: true,
    });

    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should set timer init timer', () => {
    jest.spyOn(component as any, 'initTimer');
    jest.spyOn(component, 'isPosPayment').mockReturnValue(false);

    component.timer = new ElementRef(document.createElement('div'));
    expect(component['initTimer']).toHaveBeenCalled();
  });

  it('should get is show approved iframe', () => {

    const statusSpy = jest.spyOn(component, 'status', 'get').mockReturnValue(PaymentStatusEnum.STATUS_IN_PROCESS);
    const specificStatusSpy =
      jest.spyOn(component, 'specificStatus', 'get').mockReturnValue(PaymentSpecificStatusEnum.STATUS_APPROVED);

    expect(component.isShowApprovedIframe).toBe(true);
    expect(statusSpy).toHaveBeenCalled();
    expect(specificStatusSpy).toHaveBeenCalled();

  });

  it('should get success link', () => {

    const nodeResultMock: any = {
      paymentDetails: {
        frontendSuccessUrl: null,
      },
    };

    component.nodeResult = nodeResultMock;
    expect(component.successLink).toBeNull();

    nodeResultMock.paymentDetails = { frontendSuccessUrl: 'frontendSuccessUrl' };
    expect(component.successLink).toEqual('frontendSuccessUrl');

  });

  it('should get signing link', () => {

    const nodeResultMock: any = {
      paymentDetails: {
        signingLink: null,
      },
    };

    component.nodeResult = nodeResultMock;
    expect(component.signingLink).toBeNull();

    nodeResultMock.paymentDetails = { signingLink: 'signingLink' };
    expect(component.signingLink).toEqual('signingLink');

  });

  it('should get contract url', () => {

    const nodeResultMock: any = {
      paymentDetails: null,
    };

    component.nodeResult = null;
    expect(component.contractUrl).toBeUndefined();

    component.nodeResult = nodeResultMock;
    expect(component.contractUrl).toBeUndefined();

    nodeResultMock.paymentDetails = { documentSigningUrl: 'url/document' };
    expect(component.contractUrl).toEqual('url/document');

  });

  it('should check is status success', () => {

    const specificStatusSpy = jest.spyOn(component, 'specificStatus', 'get');
    jest.spyOn(component, 'isShowApprovedIframe', 'get').mockReturnValue(false);

    specificStatusSpy.mockReturnValue(PaymentSpecificStatusEnum.STATUS_PENDING);
    expect(component.isStatusSuccess()).toBe(false);

    specificStatusSpy.mockReturnValue(PaymentSpecificStatusEnum.STATUS_SIGNED);
    expect(component.isStatusSuccess()).toBe(true);

  });

  it('should check is status pending', () => {

    const specificStatusSpy = jest.spyOn(component, 'specificStatus', 'get');

    specificStatusSpy.mockReturnValue(PaymentSpecificStatusEnum.STATUS_SIGNED);
    expect(component.isStatusPending()).toBe(false);

    specificStatusSpy.mockReturnValue(PaymentSpecificStatusEnum.STATUS_CONTROL);
    expect(component.isStatusPending()).toBe(true);

  });

  it('should check is status fail', () => {

    const statusSpy = jest.spyOn(component, 'status', 'get');

    statusSpy.mockReturnValue(PaymentStatusEnum.STATUS_ACCEPTED);
    expect(component.isStatusFail()).toBe(false);


    statusSpy.mockReturnValue(PaymentStatusEnum.STATUS_CANCELLED);
    expect(component.isStatusFail()).toBe(true);

  });

  it('should handle isValidUrl correctly', () => {

    expect(component.isValidUrl('https://payever.org')).toBeTruthy();
    expect(component.isValidUrl('payever-org')).toBeFalsy();

  });

  describe('initTimer', () => {
    it('should init timer correctly', fakeAsync(() => {
      component['initTimer']();
      tick(1000);
      expect(component.timerText$.getValue()).toEqual('59');

      discardPeriodicTasks();
    }));

    it('should init timer redirect if time is out', fakeAsync(() => {
      jest.spyOn(component, 'successLink', 'get').mockReturnValue(successLink);

      component['initTimer']();

      tick(60000);
      expect(component.timerText$.getValue()).toEqual('0');
      expect(window.location.href).toEqual(successLink);


      discardPeriodicTasks();
    }));
  });



  it('should get translations', () => {

    enum Workdays {
      Monday = 'monday',
      Tuesday = 'tuesday',
      Wednesnday = 'wednesday',
      Thursday = 'thursday',
      Friday = 'friday',
    }

    jest.spyOn(component, 'isPosPayment').mockReturnValue(false);

    expect(component.translations).toEqual({
      processingTitle: $localize`:@@santander-dk.inquiry.finish.application_check_status_processing.title:`,
      processingText: $localize`:@@santander-dk.inquiry.finish.application_check_status_processing.text:`,
      contactsNote: $localize`:@@santander-dk.inquiry.finish.application_pending.contacts_note:`,
      openingHoursTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.title:`,
      workdays: Object.values(Workdays).map(day => ({
        title: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.workday.title:${day}:day:`,
        hours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.workday.hours:`,
      })),
      saturdayTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.saturday.title:`,
      saturdayHours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.saturday.hours:`,
      sundayTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.sunday.title:`,
      sundayHours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.sunday.hours:`,
      finishDescription: $localize`:@@santander-dk.inquiry.finish.application_success.finish_application_description:`,
    });

  });

  it('should get translations for isPos branch', () => {

    enum Workdays {
      Monday = 'monday',
      Tuesday = 'tuesday',
      Wednesnday = 'wednesday',
      Thursday = 'thursday',
      Friday = 'friday',
    }

    jest.spyOn(component, 'isPosPayment').mockReturnValue(true);

    expect(component.translations).toEqual({
      processingTitle: $localize`:@@santander-dk.inquiry.finish.application_check_status_processing.title:`,
      processingText: $localize`:@@santander-dk.inquiry.finish.application_check_status_processing.text:`,
      contactsNote: $localize`:@@santander-dk.inquiry.finish.application_pending.contacts_note:`,
      openingHoursTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.title:`,
      workdays: Object.values(Workdays).map(day => ({
        title: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.workday.title:${day}:day:`,
        hours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.workday.hours:`,
      })),
      saturdayTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.saturday.title:`,
      saturdayHours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.saturday.hours:`,
      sundayTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.sunday.title:`,
      sundayHours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.sunday.hours:`,
      finishDescription: $localize`:@@santander-dk.inquiry.finish.application_success.finish_application_description_pos:`,
    });

  });

  it('should _onStatusSuccess return nothing', () => {

    expect(component['_onStatusSuccess']()).toBeUndefined();

  });

  describe('handleLinkClick', () => {
    beforeEach(() => {
      jest.spyOn(component, 'signingLink', 'get').mockReturnValue(signingLink);
      jest.spyOn(component, 'successLink', 'get').mockReturnValue(successLink);
    });

    it('should open signing link if isValidUrl', () => {
      jest.spyOn(component, 'isValidUrl').mockReturnValue(true);
      jest.spyOn(component, 'isPosPayment').mockReturnValue(true);
      jest.spyOn(window, 'open').mockReturnValue(null);

      component.handleLinkClick();
      expect(component.isValidUrl).toHaveBeenCalledWith(signingLink);
      expect(window.open).toHaveBeenCalledWith(signingLink, '_blank');
    });

    it('should update location href if isPosPayment false', () => {
      jest.spyOn(component, 'isValidUrl').mockReturnValue(false);
      jest.spyOn(component, 'isPosPayment').mockReturnValue(false);

      component.handleLinkClick();
      expect(window.location.href).toEqual(successLink);
    });
  });

});

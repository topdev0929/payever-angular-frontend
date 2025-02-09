import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  FinishStatusFailComponent,
  FinishStatusPendingComponent,
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
  FinishWrapperComponent,
} from '@pe/checkout/finish/components';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { FlowState, PatchPaymentDetails, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  FinishProvidersTestHelper,
  QueryChildByDirective,
  locationMock,
} from '@pe/checkout/testing';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { AdditionalStepsModule } from '../../../additional-steps';
import { StepsContainerComponent } from '../../../additional-steps/components';
import { flowWithPaymentOptionsFixture } from '../../../test';
import { ApplicationFlowTypeEnum } from '../../constants';
import { FormConfigService } from '../../services';

import { SiningStatusComponent } from './components/sining-status.component';
import { FinishStyleComponent } from './finish-style.component';
import { FinishComponent } from './finish.component';

describe('FinishComponent', () => {

  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;
  let store: Store;
  let externalRedirectStorage: ExternalRedirectStorage;

  const ApplicationFlowType$ = new BehaviorSubject<ApplicationFlowTypeEnum>(
    ApplicationFlowTypeEnum.TwoApplicants
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishComponent,
        FinishStyleComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
        ExternalRedirectStorage,
      ],
    }).overrideProvider(FormConfigService, {
      useValue: {
        ApplicationFlowType$: ApplicationFlowType$.asObservable(),
      },
    });
  });

  const createComponent = (applicationFlowType = ApplicationFlowTypeEnum.TwoApplicants) => {
    store = TestBed.inject(Store);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentDetails({
      applicationFlowType,
    }));
    fixture = TestBed.createComponent(FinishComponent);
    component = fixture.componentInstance;

    component.nodeResult = {
      createdAt: '',
      id: '',
      payment: null,
      paymentItems: [],
      paymentDetails: {
        clickAndCollect: false,
      },
      _apiCall: {
        id: '',
        successUrl: 'url',
      },
    };

    component.embeddedMode = true;
    component.isLoading = false;
    component.errorMessage = '';

    fixture.detectChanges();
  };

  beforeEach(() => {
    createComponent();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();

      component.payment = {
        status: PaymentStatusEnum.STATUS_PAID,
      };
      component.nodeResult.paymentDetails.identificationCenterLink = 'link';


      fixture.detectChanges();
    });

    it('Should initialize the timer', () => {
      const isTimerShown = component.isTimerShown();
      const timerEl = fixture.debugElement.query(By.css('.timer'));

      expect(isTimerShown).toEqual(true);
      expect(timerEl).toBeTruthy();
    });

    it('Should initialize timer and update timerText', () => {
      const timerText = '<strong>{{timer}}</strong>';
      jest.spyOn(component, 'isTimerShown').mockReturnValue(true);
      locationMock();
      component.isLoading = false;

      component['initTimer']();

      expect(component['timerSubscription']).toBeDefined();
      expect(component.timerText$.value).toBe(timerText.replace('{{timer}}', '120'));

      jest.advanceTimersByTime(3000);
      expect(component.timerText$.value).toBe(timerText.replace('{{timer}}', '117'));

      jest.advanceTimersByTime(117000);
      expect(component['timerSubscription'].closed).toBe(true);
    });
  });

  describe('payment has "success" status', () => {
    beforeEach(() => {
      component.payment = {
        status: PaymentStatusEnum.STATUS_PAID,
      };

      fixture.detectChanges();
    });

    it('Should display "FinishStatusSuccessComponent" component', () => {
      const isStatusSuccess = component.isStatusSuccess();
      const successStatusEl = fixture.debugElement.query(By.directive(FinishStatusSuccessComponent));

      expect(isStatusSuccess).toEqual(true);
      expect(successStatusEl).toBeTruthy();
    });

    it('Should not display other status components', () => {
      const isStatusPending = component.isStatusPending();
      const isStatusFail = component.isStatusFail();
      const isStatusUnknown = component.isStatusUnknown();
      const otherStatusEls = [FinishStatusPendingComponent, FinishStatusFailComponent, FinishStatusUnknownComponent]
        .map(c => fixture.debugElement.query(By.directive(c)));

      expect(isStatusPending).toEqual(false);
      expect(isStatusFail).toEqual(false);
      expect(isStatusUnknown).toEqual(false);
      otherStatusEls.forEach(el => expect(el).toBeFalsy());
    });

    describe('When "isClickAndCollect" is false "identificationCenterLink" exists', () => {
      const redirectUrl = 'http://redirectUrl.com';
      const successUrl = 'http://successUrl.com';

      beforeEach(() => {
        component.nodeResult.paymentDetails.identificationCenterLink = redirectUrl;
        component.nodeResult._apiCall.successUrl = successUrl;
        fixture.detectChanges();
      });

      it('Should handle link click and open redirect URL in new window', (done) => {
        const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue({ focus: jest.fn() } as any);
        const handleLinkClickSpy = jest.spyOn(component, 'handleLinkClick');
        const finishButton = fixture.debugElement.query(By.css('.finish-button'));
        jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(null));
        const topLocationServiceHrefSpy = jest.spyOn(component['topLocationService'], 'href', 'set');

        finishButton.nativeElement.click();

        store.selectOnce(FlowState.flow).pipe(
          tap(() => {
            done();
            expect(windowOpenSpy).toHaveBeenCalledWith(redirectUrl, '_blank');
            expect(topLocationServiceHrefSpy).toHaveBeenCalledWith(successUrl);
          }),
        ).subscribe();

        expect(handleLinkClickSpy).toHaveBeenCalled();
      });

      it('Should handle link click when opening redirect URL is blocked', (done) => {
        const event = new MouseEvent('click');
        jest.spyOn(window, 'open').mockReturnValue(null);
        const topLocationServiceHrefSpy = jest.spyOn(component['topLocationService'], 'href', 'set');
        jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(null));

        store.selectOnce(FlowState.flow).pipe(
          tap(() => {
            done();
            expect(topLocationServiceHrefSpy).toHaveBeenCalledWith(redirectUrl);
          }),
        ).subscribe();

        component.handleLinkClick(event);
      });

      it('Should handle link click with error when opening redirect URL throws an error', (done) => {
        const event = new MouseEvent('click');
        jest.spyOn(window, 'open').mockImplementation(() => {
          throw new Error();
        });
        jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(null));
        const topLocationServiceHrefSpy = jest.spyOn(component['topLocationService'], 'href', 'set');

        store.selectOnce(FlowState.flow).pipe(
          tap(() => {
            done();
            expect(topLocationServiceHrefSpy).toHaveBeenCalledWith(redirectUrl);
          }),
        ).subscribe();

        component.handleLinkClick(event);
      });
    });
  });

  describe('payment has "pending" status', () => {
    beforeEach(() => {
      component.payment = {
        status: PaymentStatusEnum.STATUS_IN_PROCESS,
      };

      fixture.detectChanges();
    });

    it('Should display "FinishStatusPendingComponent" component', () => {
      const isStatusPending = component.isStatusPending();
      const pendingStatusEl = fixture.debugElement.query(By.directive(FinishStatusPendingComponent));

      expect(isStatusPending).toEqual(true);
      expect(pendingStatusEl).toBeTruthy();
    });

    it('Should not display other status components', () => {
      const isStatusSuccess = component.isStatusSuccess();
      const isStatusFail = component.isStatusFail();
      const isStatusUnknown = component.isStatusUnknown();
      const otherStatusEls = [FinishStatusSuccessComponent, FinishStatusFailComponent, FinishStatusUnknownComponent]
        .map(c => fixture.debugElement.query(By.directive(c)));

      expect(isStatusSuccess).toEqual(false);
      expect(isStatusFail).toEqual(false);
      expect(isStatusUnknown).toEqual(false);
      otherStatusEls.forEach(el => expect(el).toBeFalsy());
    });

    it('Should not display any button', () => {
      const finishWrapperEl = fixture.debugElement.query(By.directive(FinishWrapperComponent));
      const finishWrapperComponent = finishWrapperEl.injector.get(FinishWrapperComponent);

      expect(finishWrapperComponent.buttons).toEqual({});
    });
  });

  describe('payment has "fail" status', () => {
    beforeEach(() => {
      component.payment = {
        status: PaymentStatusEnum.STATUS_DECLINED,
      };

      fixture.detectChanges();
    });

    it('Should display "FinishStatusFailComponent" component', () => {
      const isStatusFail = component.isStatusFail();
      const failStatusEl = fixture.debugElement.query(By.directive(FinishStatusFailComponent));

      expect(isStatusFail).toEqual(true);
      expect(failStatusEl).toBeTruthy();
    });

    it('Should not display other status components', () => {
      const isStatusSuccess = component.isStatusSuccess();
      const isStatusPending = component.isStatusPending();
      const isStatusUnknown = component.isStatusUnknown();
      const otherStatusEls = [FinishStatusSuccessComponent, FinishStatusPendingComponent, FinishStatusUnknownComponent]
        .map(c => fixture.debugElement.query(By.directive(c)));

      expect(isStatusSuccess).toEqual(false);
      expect(isStatusPending).toEqual(false);
      expect(isStatusUnknown).toEqual(false);
      otherStatusEls.forEach(el => expect(el).toBeFalsy());
    });
  });

  describe('payment has "unknown" status', () => {
    beforeEach(() => {
      jest.spyOn(component, 'isStatusUnknown').mockReturnValue(true);

      fixture.detectChanges();
    });

    it('Should display "FinishStatusFailComponent" component', () => {
      const isStatusUnknown = component.isStatusUnknown();
      const failStatusEl = fixture.debugElement.query(By.directive(FinishStatusUnknownComponent));

      expect(isStatusUnknown).toEqual(true);
      expect(failStatusEl).toBeTruthy();
    });

    it('Should not display other status components', () => {
      const isStatusSuccess = component.isStatusSuccess();
      const isStatusPending = component.isStatusPending();
      const isStatusFail = component.isStatusFail();
      const otherStatusEls = [FinishStatusSuccessComponent, FinishStatusPendingComponent, FinishStatusFailComponent]
        .map(c => fixture.debugElement.query(By.directive(c)));

      expect(isStatusSuccess).toEqual(false);
      expect(isStatusPending).toEqual(false);
      expect(isStatusFail).toEqual(false);
      otherStatusEls.forEach(el => expect(el).toBeFalsy());
    });
  });

  describe('additionalSteps', () => {
    beforeEach(() => {
      jest.spyOn(component, 'isStatusPending').mockReturnValue(true);
      jest.spyOn(component as any, 'hasTwoApplicants', 'get').mockReturnValue(false);

      fixture.detectChanges();
    });

    it('should show steps-container', () => {
      fixture.detectChanges();
      QueryChildByDirective(fixture, StepsContainerComponent);
    });

    it('Should not display other status components', () => {
      const isStatusSuccess = component.isStatusSuccess();
      const isStatusPending = component.isStatusPending();
      const isStatusFail = component.isStatusFail();
      const otherStatusEls = [
        ...[
        FinishStatusUnknownComponent,
        FinishStatusSuccessComponent,
        FinishStatusPendingComponent,
        FinishStatusFailComponent,
        SiningStatusComponent,
      ].map(c => fixture.debugElement.query(By.directive(c))),
      ...[
        '.cc-btn',
        '.cc-text',
        '.timer',
      ].map(c => fixture.debugElement.query(By.css(c))),
    ];

      expect(isStatusSuccess).toEqual(false);
      expect(isStatusPending).toEqual(true);
      expect(isStatusFail).toEqual(false);
      otherStatusEls.forEach(el => expect(el).toBeFalsy());
    });
  });
});

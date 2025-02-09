import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { cold } from 'jest-marbles';
import { ReplaySubject, Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PatchPaymentDetails, PaymentState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, clearValidators } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { InquiryFormComponent } from './inquiry-form.component';
import { CreditCardValidator } from './validators';

describe('stripe-inquiry-form', () => {
  let store: Store;
  let component: InquiryFormComponent;
  let fixture: ComponentFixture<InquiryFormComponent>;
  let formGroup: InstanceType<typeof InquiryFormComponent>['formGroup'];
  const submit$ = new Subject<number>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: PaymentSubmissionService, useValue: submit$ },
        CreditCardValidator,
      ],
      declarations: [
        InquiryFormComponent,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentDetails({
      cardNumber: 'card-number',
      cardHolderName: 'card-holder-name',
      cardCvc: 'card-cvc',
      cardExpiration: ['2', '12'],
    }));
    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;
    formGroup = component.formGroup;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });


  describe('component', () => {
    it('SHould patch fromGroup with payment-details', () => {
      fixture.detectChanges();
      fixture.changeDetectorRef.markForCheck();
      component.ngOnInit();
      const paymentDetails = store.selectSnapshot(PaymentState.details);
      expect(formGroup.value).toEqual({
        cardNumber: paymentDetails.cardNumber,
        cardHolderName: paymentDetails.cardHolderName,
        cardCvc: paymentDetails.cardCvc,
        cardExpiration: paymentDetails.cardExpiration.join(''),
      });
    });

    it('Should emit submitted when from becomes valid', (done) => {
      formGroup.setAsyncValidators([
        jest.fn().mockReturnValue(of(null)),
      ]);
      const submitted = jest.spyOn(component.submitted, 'emit');
      const paymentDetails = {
        cardNumber: 'card-number',
        cardHolderName: 'card-holder-name',
        cardCvc: 'card-cvc',
        cardExpiration: ['02', '12'],
      };
      clearValidators(formGroup, true);
      const loadingReplay$ = new ReplaySubject<boolean>();
      component.loading.subscribe(loadingReplay$);

      component.submitted.pipe(
        tap(() => {
          expect(submitted).toHaveBeenCalled();
          expect(loadingReplay$).toBeObservable(cold('(tf)', { t: true, f: false }));
          done();
        })
      ).subscribe();

      formGroup.patchValue({
        cardNumber: paymentDetails.cardNumber,
        cardHolderName: paymentDetails.cardHolderName,
        cardCvc: paymentDetails.cardCvc,
        cardExpiration: paymentDetails.cardExpiration.join(''),
      });
      submit$.next(Date.now());
    });
  });
});


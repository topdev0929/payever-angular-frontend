import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';


import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';

import { CreditCardValidator } from './cc-async.validator';



describe('CreditCardValidator', () => {
  let instance: CreditCardValidator;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;
  let store: Store;
  const submit$ = new Subject<number>();
  const fb = new FormBuilder();
  const formGroup = fb.group({
    cardNumber: fb.control<string>(null),
    cardHolderName: fb.control<string>(null),
    cardExpiration: fb.control<string>(null),
    cardCvc: fb.control<string>(null),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        CreditCardValidator,
        { provide: PaymentSubmissionService, useValue: submit$ },
      ],
      declarations: [
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    instance = TestBed.inject(CreditCardValidator);
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);
    formGroup.setAsyncValidators([
      instance.validate.bind(instance),
    ]);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('Should return null on valid cc', (done) => {
      const assignPaymentDetails = jest.spyOn(NodeFlowService.prototype, 'assignPaymentDetails');
      const flow = store.selectSnapshot(FlowState.flow);
      formGroup.patchValue({
        cardNumber: 'card-number',
        cardHolderName: 'card-holder-name',
        cardCvc: 'card-cvc',
        cardExpiration: '0212',
      });
      formGroup.statusChanges.pipe(
        filter(status => status !== 'PENDING'),
        take(1),
        tap((status) => {
          expect(status).toEqual('VALID');
          expect(assignPaymentDetails).toHaveBeenCalledWith({ tokenId: 'token-id' });
          done();
        }),
      ).subscribe();
      submit$.next(Date.now());
      const url = `${env.thirdParty.payments}/api/connection/${flow.connectionId}/action/get-publish-key`;
      const getPublishKey = httpTestingController.expectOne(url);
      expect(getPublishKey.request.method).toEqual('POST');
      getPublishKey.flush({ publishKey: 'publish-key' });

      const validationReq = httpTestingController.expectOne('https://api.stripe.com/v1/tokens');
      expect(validationReq.request.method).toEqual('POST');
      validationReq.flush({ id: 'token-id' });
    });

    describe('Should return error on invalid cc', () => {
      const cases: {
        code: string;
        field: keyof typeof formGroup['controls'];
        message: string;
      }[] = [
          {
            code: 'invalid_number',
            field: 'cardNumber',
            message: '',
          },
          {
            code: 'incorrect_number',
            field: 'cardNumber',
            message: '',
          },
          {
            code: 'invalid_card_type',
            field: 'cardNumber',
            message: '',
          },
          {
            code: 'invalid_charge_amount',
            field: 'cardNumber',
            message: '',
          },
          {
            code: 'invalid_cvc',
            field: 'cardCvc',
            message: '',
          },
          {
            code: 'invalid_expiry_month',
            field: 'cardExpiration',
            message: '',
          },
          {
            code: 'invalid_expiry_year',
            field: 'cardExpiration',
            message: '',
          },
          {
            code: 'an other error',
            field: 'cardNumber',
            message: '',
          },
        ];

      it.each(cases)('Case %#: %p', ({ code, field, message }, done) => {

        const assignPaymentDetails = jest.spyOn(NodeFlowService.prototype, 'assignPaymentDetails');
        const flow = store.selectSnapshot(FlowState.flow);

        formGroup.patchValue({
          cardNumber: 'card-number',
          cardHolderName: 'card-holder-name',
          cardCvc: 'card-cvc',
          cardExpiration: '0212',
        });
        formGroup.statusChanges.pipe(
          filter(status => status !== 'PENDING'),
          take(1),
          tap((status) => {
            expect(status).toEqual('INVALID');
            expect(assignPaymentDetails).toHaveBeenCalledWith({ tokenId: 'token-id' });
            expect(formGroup.get(field).errors).toEqual({ [field]: message });
            done();
          }),
        ).subscribe();
        submit$.next(Date.now());
        const url = `${env.thirdParty.payments}/api/connection/${flow.connectionId}/action/get-publish-key`;
        const getPublishKey = httpTestingController.expectOne(url);
        expect(getPublishKey.request.method).toEqual('POST');
        getPublishKey.flush({ publishKey: 'publish-key' });

        const validationReq = httpTestingController.expectOne('https://api.stripe.com/v1/tokens');
        expect(validationReq.request.method).toEqual('POST');
        validationReq.flush({ code }, { status: 400, statusText: 'Bad Request' });
      });
    });
  });
});

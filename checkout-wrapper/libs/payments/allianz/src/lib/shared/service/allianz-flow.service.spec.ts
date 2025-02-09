import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import {
    PatchPaymentResponse,
    PaymentState,
    SetFlow,
    SetPayments,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';

import { AllianzApiService } from './allianz-api.service';
import { AllianzFlowService } from './allianz-flow.service';

describe('AllianzFlowService', () => {
    let service: AllianzFlowService;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                AllianzApiService,
                AllianzFlowService,
            ],
        });

        service = TestBed.inject(AllianzFlowService);
        store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get payment and dispatch the patch action', () => {
        const connectionId = flowWithPaymentOptionsFixture().connectionId;
        const paymentResponse = {
            id: '1234',
        } as NodePaymentResponseInterface<any>;

        store.dispatch(new SetPayments({
            [PaymentMethodEnum.ALLIANZ]: {
                ...store.selectSnapshot(PaymentState),
            },
        }));
        store.dispatch(new PatchPaymentResponse(paymentResponse));

        const getPaymentSpy = jest.spyOn(service['allianzApiService'], 'getPayment')
            .mockReturnValue(of(paymentResponse));
        const dispatchSpy = jest.spyOn(store, 'dispatch').mockReturnValue(of(null));

        service.getPayment().subscribe((response) => {
            expect(response).toEqual(paymentResponse);
        });

        expect(getPaymentSpy).toHaveBeenCalledWith(connectionId, '1234');

        expect(dispatchSpy).toHaveBeenCalledWith(new PatchPaymentResponse(paymentResponse));
    });
});

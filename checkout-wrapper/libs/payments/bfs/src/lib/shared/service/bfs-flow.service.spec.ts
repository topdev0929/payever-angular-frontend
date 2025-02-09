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

import { BfsApiService } from './bfs-api.service';
import { BfsFlowService } from './bfs-flow.service';

describe('BfsFlowService', () => {
    let service: BfsFlowService;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                BfsApiService,
                BfsFlowService,
            ],
        });

        service = TestBed.inject(BfsFlowService);
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
            [PaymentMethodEnum.BFS_B2B_BNPL]: {
                ...store.selectSnapshot(PaymentState),
            },
        }));

        store.dispatch(new PatchPaymentResponse(paymentResponse));

        const getPaymentSpy = jest.spyOn(service['bfsApiService'], 'getPayment')
            .mockReturnValue(of(paymentResponse));
        const dispatchSpy = jest.spyOn(store, 'dispatch').mockReturnValue(of(null));

        service.getPayment().subscribe((response) => {
            expect(response).toEqual(paymentResponse);
        });

        expect(getPaymentSpy).toHaveBeenCalledWith(connectionId, '1234');

        expect(dispatchSpy).toHaveBeenCalledWith(new PatchPaymentResponse(paymentResponse));
    });
});

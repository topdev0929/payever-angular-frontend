import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow, SetPayments } from '@pe/checkout/store';

import { flowFixture } from '../fixtures';
import { paymentFixture } from '../fixtures/payment.fixture';

export class StoreHelper {
    setMockData() {
        const store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowFixture()));
        store.dispatch(new SetPayments(paymentFixture()));
    }
}

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { ClearFormState, SetFlow } from '@pe/checkout/store';
import {
    CommonImportsTestHelper,
    CommonProvidersTestHelper,
} from '@pe/checkout/testing';

import { BaseEditContainerComponent, PaymentService } from '../shared';
import { flowWithPaymentOptionsFixture } from '../test';

import { EditContainerComponent } from './edit-container.component';

describe('EditContainerComponent', () => {
    let component: EditContainerComponent;
    let fixture: ComponentFixture<EditContainerComponent>;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            declarations: [
              EditContainerComponent,
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                PaymentInquiryStorage,
                AddressStorageService,
                {
                  provide: ABSTRACT_PAYMENT_SERVICE,
                  useClass: PaymentService,
                },
            ],
        });
    });

    beforeEach(() => {
        store = TestBed.inject(Store);
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(EditContainerComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('constructor', () => {
        it('Should check if component defined', () => {
            expect(component).toBeDefined();
        });
    });


  describe('Lifecycle hooks', () => {
    it('should dispatch ClearFormState on ngOnDestroy', () => {
      jest.spyOn(store, 'dispatch');

      component.ngOnDestroy();

      expect(store.dispatch).toHaveBeenCalledWith(new ClearFormState());
    });

    it('should call super.ngOnInit on ngOnInit', () => {
      const superNgOnInitSpy = jest.spyOn(BaseEditContainerComponent.prototype, 'ngOnInit');

      component.ngOnInit();

      expect(superNgOnInitSpy).toHaveBeenCalled();

      superNgOnInitSpy.mockRestore();
    });
  });
});

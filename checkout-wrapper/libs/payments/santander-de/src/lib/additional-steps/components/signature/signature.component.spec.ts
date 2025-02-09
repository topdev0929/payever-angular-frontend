import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { DialogService } from '@pe/checkout/dialog';
import { TopLocationService } from '@pe/checkout/location';
import { PatchPaymentResponse, PaymentState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, fakeOverlayContainer } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentSpecificStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { AdditionalStepsModule } from '../../additional-steps.module';

import { SignatureComponent } from './signature.component';

describe('SignatureComponent', () => {
  let component: SignatureComponent;
  let fixture: ComponentFixture<SignatureComponent>;
  let store: Store;

  const overlayContainer = fakeOverlayContainer();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
      ],
      providers: [
        overlayContainer.fakeElementContainerProvider,
        ...CommonProvidersTestHelper(),
        DialogService,
        NodeApiService,
        TopLocationService,
      ],
      declarations: [
        SignatureComponent,
      ],
    });
    jest.spyOn(NodeApiService.prototype, 'getShopUrls')
      .mockReturnValue(of({
        successUrl: 'successUrl',
        failureUrl: 'failureUrl',
        pendingUrl: 'pendingUrl',
        cancelUrl: 'cancelUrl',
      }));
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(SignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.debugElement.nativeElement.appendChild(overlayContainer.overlayContainerElement);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('component', () => {
    it('should redirect to shop', () => {
      fixture.detectChanges();
      const mockResponse = {
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_SIGNED,
        },
      } as NodePaymentResponseInterface<any>;

      store.dispatch(new PatchPaymentResponse(mockResponse)); 
      fixture.detectChanges();

      const continueBtn = fixture.debugElement.query(By.css('.action-button'));
      expect(continueBtn).toBeTruthy();
      const onClicked = jest.spyOn(SignatureComponent.prototype, 'onClicked');
      const href = jest.spyOn(TopLocationService.prototype, 'href', 'set');
      href.mockReturnValue(null);
      continueBtn.nativeElement.click();
      expect(onClicked).toHaveBeenCalled();
      expect(href).toHaveBeenCalledWith('successUrl');
    });

    it('should show loading', () => {
      fixture.detectChanges();

      expect(store.selectSnapshot(PaymentState.response)).toBeFalsy();
      const loading = fixture.debugElement.query(By.css('.loading'));
      expect(loading).toBeTruthy();
    });
  });
});

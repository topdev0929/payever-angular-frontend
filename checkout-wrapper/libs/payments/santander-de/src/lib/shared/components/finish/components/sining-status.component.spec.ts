import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { DialogService } from '@pe/checkout/dialog';
import { TopLocationService } from '@pe/checkout/location';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentSpecificStatusEnum } from '@pe/checkout/types';

import { SiningStatusComponent } from './sining-status.component';

describe('SiningStatusComponent', () => {
  let component: SiningStatusComponent;
  let fixture: ComponentFixture<SiningStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        DialogService,
        NodeApiService,
        TopLocationService,
      ],
      declarations: [
        SiningStatusComponent,
      ],
    });
    jest.spyOn(NodeApiService.prototype, 'getShopUrls')
      .mockReturnValue(of({
        successUrl: 'successUrl',
        failureUrl: 'failureUrl',
        pendingUrl: 'pendingUrl',
        cancelUrl: 'cancelUrl',
      }));
    fixture = TestBed.createComponent(SiningStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    it('should redirect to shop - declined', () => {
      fixture = TestBed.createComponent(SiningStatusComponent);
      fixture.componentRef.setInput('specificStatus',
        PaymentSpecificStatusEnum.STATUS_ABGELEHNT
      );
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn).toBeTruthy();

      const href = jest.spyOn(TopLocationService.prototype, 'href', 'set');
      href.mockReturnValue(null);

      btn.nativeElement.click();
      expect(href).toHaveBeenCalledWith('failureUrl');
    });

    it('should redirect to shop - undecided', () => {
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn).toBeTruthy();

      const href = jest.spyOn(TopLocationService.prototype, 'href', 'set');
      href.mockReturnValue(null);

      btn.nativeElement.click();
      expect(href).toHaveBeenCalledWith('pendingUrl');
    });
  });
});

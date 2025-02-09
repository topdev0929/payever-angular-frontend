import { ChangeDetectionStrategy, Component, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractContainerComponent } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { SharedModule } from '../shared.module';

import { BaseContainerComponent } from './base-container.component';

@Component({
  selector: 'extends-base-container-component',
  template: '<div></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExtendsBaseContainerComponent extends BaseContainerComponent {
}

describe('BaseContainerComponent', () => {
  let fixture: ComponentFixture<ExtendsBaseContainerComponent>;
  let component: ExtendsBaseContainerComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        PaymentInquiryStorage,
        AddressStorageService,
      ],
    });

    fixture = TestBed.createComponent(ExtendsBaseContainerComponent);
    component = fixture.componentInstance;
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof BaseContainerComponent).toBeTruthy();
      expect(component instanceof AbstractContainerComponent).toBeTruthy();
    });
  });
});


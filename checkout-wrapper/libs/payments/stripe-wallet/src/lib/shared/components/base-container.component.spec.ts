import { ChangeDetectionStrategy, Component, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AbstractContainerComponent } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { SharedModule } from '../shared.module';

import { BaseContainerComponent } from './base-container.component';

@Component({
  selector: 'extends-base-container-component',
  template: '',
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

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof BaseContainerComponent).toBeTruthy();
      expect(component instanceof AbstractContainerComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should ngOnInit', () => {
      jest.spyOn(component.isFinishModalShown$, 'next').mockImplementation(() => of(true));
      const emit = jest.spyOn(component.finishModalShown, 'emit');

      component.isFinishModalShown$.subscribe({
        next: () => expect(emit).toBeCalledWith(true),
      });

      component.ngOnInit();
    });
  });
});


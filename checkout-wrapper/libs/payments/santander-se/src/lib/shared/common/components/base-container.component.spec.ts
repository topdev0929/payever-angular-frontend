
import { Component, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockInstance, MockModule } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import { StorageModule } from '@pe/checkout/storage';
import { PatchFlow, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { SharedModule } from '../../shared.module';

import { BaseContainerComponent } from './base-container.component';

@Component({
  selector: 'extends-base-container-component',
  template: '<div></div>',
})
class ExtendsBaseContainerComponent extends BaseContainerComponent implements OnInit {
  _nodeFlowService = this.nodeFlowService;

  ngOnInit(): void {
    super.ngOnInit();
  }
}

describe('BaseContainerComponent', () => {
  let fixture: ComponentFixture<ExtendsBaseContainerComponent>;
  let component: ExtendsBaseContainerComponent;

  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        StorageModule,
        MockModule(SharedModule),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
        {
          provide: NodeFlowService, useValue: {
            getFinalResponse: jest.fn().mockImplementation(() => of({})),
          },
        },
        {
          provide: NodeApiService, useValue: MockInstance(NodeApiService),
        },
      ],
      declarations: [
        ExtendsBaseContainerComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchFlow({
      connectionId: 'santander_pos_installment_se:id',
    }));
    fixture = TestBed.createComponent(ExtendsBaseContainerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllMocks();
  });

  describe('component', () => {
    it('should return isPos based on the payment method', () => {
      fixture.detectChanges();

      expect(component.isPos).toEqual(true);
    });

    it('should call super.ngOnInit', () => {
      const ngOnInit = jest.spyOn(AbstractPaymentContainerComponent.prototype, 'ngOnInit');

      component.ngOnInit();

      expect(ngOnInit).toHaveBeenCalled();
      expect(component._nodeFlowService.getFinalResponse).toHaveBeenCalled();
    });
  });
});

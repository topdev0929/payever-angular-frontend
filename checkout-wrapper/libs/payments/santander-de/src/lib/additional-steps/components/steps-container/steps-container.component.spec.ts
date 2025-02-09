import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { PatchPaymentDetails, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  ExpectNotToRenderChild,
  QueryChildByDirective,
} from '@pe/checkout/testing';

import { ApplicationFlowTypeEnum, EmploymentGroupEnum } from '../../../shared/constants';
import { FormConfigService } from '../../../shared/services';
import { flowWithPaymentOptionsFixture } from '../../../test';
import { AdditionalStepsModule } from '../../additional-steps.module';
import { CreditCheckComponent } from '../credit-check/credit-check.component';
import { ProofComponent } from '../proof/proof.component';
import { SignatureComponent } from '../signature/signature.component';

import { StepsContainerComponent } from './steps-container.component';
import { StepsHeaderComponent } from './steps-header/steps-header.component';

describe('StepsContainerComponent', () => {
  let component: StepsContainerComponent;
  let fixture: ComponentFixture<StepsContainerComponent>;
  let store: Store;
  const ApplicationFlowType$ = new BehaviorSubject<ApplicationFlowTypeEnum>(null);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: FormConfigService,
          useValue: {
            ApplicationFlowType$,
            employmentGroup$: of(EmploymentGroupEnum.UNKNOWN),
          },
        },
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
      ],
      declarations: [
        StepsContainerComponent,
        StepsHeaderComponent,
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
    ApplicationFlowType$.next(ApplicationFlowTypeEnum.BasicStudent);
    fixture = TestBed.createComponent(StepsContainerComponent);
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
    it('should show the finial step with finished input', () => {
      fixture.componentRef.setInput('finished', true);
      fixture.detectChanges();
      const { child: stepsHeader } = QueryChildByDirective(fixture, StepsHeaderComponent);
      expect(stepsHeader.selectedIndex).toBe(3);
      QueryChildByDirective(fixture, SignatureComponent);
    });

    it('next and skip', () => {
      jest.useFakeTimers();
      fixture.detectChanges();
      const { child: creditCheck } = QueryChildByDirective(fixture, CreditCheckComponent);
      creditCheck.ngOnInit();

      jest.advanceTimersByTime(1);

      const { child: stepsHeader } = QueryChildByDirective(fixture, StepsHeaderComponent);
      expect(stepsHeader.selectedIndex).toBe(1);

      const { childEl: proofEl } = QueryChildByDirective(fixture, ProofComponent);
      const skipButton = proofEl.query(By.css('.skip-button a'));
      expect(skipButton).toBeTruthy();
      const dispatch = jest.spyOn(Store.prototype, 'dispatch');
      skipButton.nativeElement.click();
      expect(dispatch).toBeCalledWith(new PatchPaymentDetails({
        finishOnContractCenter: true,
      }));
    });

    it('should toggle proof step visibility', () => {
      component['next']();
      Object.values(ApplicationFlowTypeEnum).forEach((applicationFlowType) => {
        ApplicationFlowType$.next(applicationFlowType);
        fixture.detectChanges();
        const visible = [
          ApplicationFlowTypeEnum.BasicStudent,
          ApplicationFlowTypeEnum.AdvancedFlow,
        ].includes(applicationFlowType);

        visible
          ? QueryChildByDirective(fixture, ProofComponent)
          : ExpectNotToRenderChild(fixture, ProofComponent);
      });
    });
  });
});

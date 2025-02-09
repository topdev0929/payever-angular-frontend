import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Select } from '@ngxs/store';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { AnalyticFormStatusEnum } from '@pe/checkout/analytics';
import { TrackingService } from '@pe/checkout/api';
import { FinishDialogService } from '@pe/checkout/finish';
import {
  SectionDataInterface,
  SectionSchemeInterface,
  SectionStorageService,
} from '@pe/checkout/form-utils';
import { ChangeFailedPayment, FlowState, PaymentState } from '@pe/checkout/store';
import {
  ChangePaymentDataInterface,
  FlowInterface,
  NodePaymentResponseInterface,
  TimestampEvent,
} from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormConfigService,
  FormInterface,
  NodePaymentResponseDetailsInterface,
  SantanderSeFlowService,
  SantanderSePaymentProcessService,
  SantanderSePaymentStateService,
} from '../../../shared';

const ANALYTICS_FORM_NAME = 'FORM_PAYMENT_DETAILS';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-se-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit, OnDestroy {

  @Select(FlowState.flow) flow$: Observable<FlowInterface>;

  @Input() showCloseButton: boolean;

  // For payment widgets when we have many payments in flow but behave like only one
  @Input() isDisableChangePayment = false;
  @Output() continue = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() requestFlowData: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  doSubmit$: Subject<void> = new Subject();
  checkStepsLogic$ = new Subject<SectionDataInterface[]>();
  isSendingPayment$ = new BehaviorSubject(false);

  isFinishModalShown$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  finishModalErrorMessage: string;
  initialData: FormInterface;
  sectionsConfig: SectionSchemeInterface[];
  formSectionsData: SectionDataInterface[] = [];

  private formConfigService = this.injector.get(FormConfigService);
  private santanderSeProcessPaymentService = this.injector.get(SantanderSePaymentProcessService);
  private sectionStorageService = this.injector.get(SectionStorageService);
  private santanderSeFlowService = this.injector.get(SantanderSeFlowService);
  protected finishDialogService = this.injector.get(FinishDialogService);
  protected santanderSePaymentStateService = this.injector.get(SantanderSePaymentStateService);
  private trackingService = this.injector.get(TrackingService);

  ngOnInit(): void {
    super.ngOnInit();
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.OPEN);
    this.trackingService.doEmitPaymentStepReached(this.flow.id, this.paymentMethod, 1);

    this.santanderSeProcessPaymentService.init(
      this.nodeResult,
      prepareData.bind(this),
    );
    this.showFinishModalFromExistingPayment();

    merge(
      this.isFinishModalShown$.pipe(
        tap(value => this.finishModalShown.emit(value)),
      ),
      this.checkStepsLogic$.pipe(
        switchMap(formSectionsData => this.formConfigService.checkStepsLogic(
          this.flow.id,
          formSectionsData,
        ).pipe(
          tap((resp) => {
            this.formSectionsData = resp;
            resp.every(section => !!section.isDisabled) && this.sendPaymentData();
            this.cdr.detectChanges();
          }),
        )),
      )
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.loadStepperConfig();
  }

  ngOnDestroy(): void {
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.CLOSED);
    this.sectionStorageService.isPassedPaymentData = null;
  }

  checkStepsLogic(formSectionsData: SectionDataInterface[]) {
    this.checkStepsLogic$.next(formSectionsData);
  }

  loadedLazyModule(formSectionsData: SectionDataInterface[]) {
    this.checkStepsLogic$.next(formSectionsData);
  }

  finishedModalShown(status: boolean) {
    this.sendPaymentData();
  }

  changePayment(data: ChangePaymentDataInterface): void {
    this.store.dispatch(new ChangeFailedPayment(data));
  }

  protected loadStepperConfig() {
    this.sectionsConfig = this.formConfigService.sectionsConfig();
    this.cdr.detectChanges();
  }

  private showFinishModalFromExistingPayment(): void {
    const nodeResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>
    = this.nodeFlowService.getFinalResponse();

    if (nodeResponse && this.santanderSeFlowService.isNeedMoreInfo(nodeResponse)) {
      this.sectionStorageService.isPassedPaymentData = false;
    }
  }

  private sendPaymentData(): void {
    const formData = this.store.selectSnapshot(PaymentState.form);
    this.isSendingPayment$.next(true);
    this.finishDialogService.disableHideOnNextNavigate();
    this.santanderSeProcessPaymentService.preparePaymentData(formData);
    this.continue.emit();
  }
}

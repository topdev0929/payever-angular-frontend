import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions, Select, ofActionCompleted } from '@ngxs/store';
import { Observable, Subject, merge } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { SectionDataInterface, SectionSchemeInterface } from '@pe/checkout/form-utils';
import { TopLocationService } from '@pe/checkout/location';
import { ChangeFailedPayment, FlowState, PaymentState, SetPaymentComplete } from '@pe/checkout/store';
import { ChangePaymentDataInterface, FlowInterface, NodePaymentResponseInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormConfigService,
  NodePaymentDetailsResponseInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-no-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent
  extends BaseContainerComponent
  implements OnInit {

  @Select(FlowState.flow) flow$: Observable<FlowInterface>;

  @Output() continue: EventEmitter<void> = new EventEmitter();

  checkStepsLogic$ = new Subject<SectionDataInterface[]>();
  doSubmit$: Subject<void> = new Subject();
  private actions$ = this.injector.get(Actions);

  private topLocationService = this.injector.get(TopLocationService);
  private formConfigService = this.injector.get(FormConfigService);
  private activatedRoute = this.injector.get(ActivatedRoute);

  public readonly processed = this.activatedRoute.snapshot.queryParams.processed;
  public formSectionsData: SectionDataInterface[];
  sectionsConfig: SectionSchemeInterface[];

  ngOnInit(): void {
    super.ngOnInit();
    this.showFinishModalFromExistingPayment();
    merge(
      this.checkStepsLogic$.pipe(
        switchMap(formSectionsData => this.formConfigService.checkStepsLogic(
          this.flow.id,
          formSectionsData,
        ).pipe(
          tap((resp) => {
            this.formSectionsData = resp;
            this.cdr.detectChanges();
          }),
        )),
      ),
      this.actions$.pipe(
        ofActionCompleted(SetPaymentComplete),
        take(1),
        tap(() => {
          this.nodeResult = this.nodeFlowService.getFinalResponse();
          this.checkStepsLogic$.next(this.formSectionsData);
          this.doSubmit$.next();
        }),
      )

    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
    this.loadStepperConfig();
  }

  protected loadStepperConfig() {
    this.sectionsConfig = this.formConfigService.sectionsConfig();
    this.cdr.detectChanges();
  }

  public loadedLazyModule(sectionData: SectionDataInterface[]): void {
    this.checkStepsLogic$.next(sectionData);
  }

  checkStepsLogic(formSectionsData: SectionDataInterface[]) {
    this.checkStepsLogic$.next(formSectionsData);
  }

  finishedModalShown() {
    if (!this.processed && this.santanderNoFlowService.isNeedApproval(this.nodeResult)) {
      this.topLocationService.href = this.nodeResult.paymentDetails.scoreResultRedirect;

      return;
    }

    this.onSend();
  }

  onSend(): void {
    const formData = this.store.selectSnapshot(PaymentState.form);

    this.sendPaymentData(formData).pipe(
      take(1),
      tap(() => this.continue.emit()),
    ).subscribe();
  }

  changePayment(data: ChangePaymentDataInterface): void {
    this.store.dispatch(new ChangeFailedPayment(data));
  }

  private showFinishModalFromExistingPayment(): void {
    const nodeResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>
    = this.nodeFlowService.getFinalResponse();

    if (nodeResponse && this.santanderNoFlowService.isNeedApproval(nodeResponse)) {
      this.sectionStorageService.isPassedPaymentData = false;
    }
  }
}

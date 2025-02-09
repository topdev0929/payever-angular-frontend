import { CdkStepper } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, inject } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { FlowState, PatchPaymentDetails } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { ApplicationFlowTypeEnum } from '../../../shared/constants';
import { FormConfigService } from '../../../shared/services';
import { INPUTS } from '../../injection-token.constants';
import { CreditCheckComponent } from '../credit-check/credit-check.component';
import { IdentificationComponent } from '../identification/identification.component';
import { ProofComponent } from '../proof/proof.component';
import { SignatureComponent } from '../signature/signature.component';

@Component({
  selector: 'santander-de-steps-container',
  templateUrl: './steps-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    { provide: CdkStepper, useExisting: StepsContainerComponent },
  ],
})
export class StepsContainerComponent {
  private formConfigService = inject(FormConfigService);
  private injector = inject(Injector);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  public stepsInjector = Injector.create({
    providers: [{
      provide: INPUTS,
      useValue: {
        next: () => { this.next() },
        skip: () => {
          this.store.dispatch(new PatchPaymentDetails({
            finishOnContractCenter: true,
          }));
        },
      },
    }],
    parent: this.injector,
  });

  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;
  public hasProofStep = false;
  private translations = {
    creditCheck: $localize`:@@santander-de.inquiry.additionalSteps.creditCheck.title:`,
    proof: $localize`:@@santander-de.inquiry.additionalSteps.proof.title:`,
    identification: $localize`:@@santander-de.inquiry.additionalSteps.identification.title:`,
    signature: $localize`:@@santander-de.inquiry.additionalSteps.signature.title:`,
  };

  selectedIndex = 0;
  @Input() finished = false;

  steps$: Observable<{
    label: string,
    component: any,
  }[]> = this.formConfigService.ApplicationFlowType$.pipe(
    map(applicationFlowType => [
      ApplicationFlowTypeEnum.BasicStudent,
      ApplicationFlowTypeEnum.AdvancedFlow,
    ].includes(applicationFlowType)),
    distinctUntilChanged(),
    map(hasProofStep => [
      {
        label: this.translations.creditCheck,
        component: CreditCheckComponent,
      },
      ...hasProofStep ? [
        {
          label: this.translations.proof,
          component: ProofComponent,
        },
      ] : [],
      {
        label: this.translations.identification,
        component: IdentificationComponent,
      },
      {
        label: this.translations.signature,
        component: SignatureComponent,
      },
    ])
  );

  private next() {
    this.selectedIndex++;
    this.cdr.detectChanges();
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';

import {
  SectionDataInterface,
  SectionSchemeInterface,
} from '@pe/checkout/form-utils';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import {
  FormConfigService,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { ChangeFailedPayment, PaymentState, StepsState } from '@pe/checkout/store';
import { ChangePaymentDataInterface, SectionType } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-pos-inquire-container',
  templateUrl: './inquire-container.component.html',
})
export class InquiryContainerComponent extends AbstractPaymentContainerComponent implements OnInit {

  public formSectionsData: SectionDataInterface[] = [];
  public doSubmit$ = new Subject<void>();
  public initialData: FormValue;
  public sectionsConfig: SectionSchemeInterface[];

  private formConfigService: FormConfigService = this.injector.get(FormConfigService);

  // For payment widgets when we have many payments in flow but behave like only one
  @Input() isDisableChangePayment = false;
  @Input() showCloseButton = false;

  forceHideAddressPanel = this.store.selectSnapshot(StepsState.isHiddenStep)(SectionType.Address);
  forceHideOcrPanel = !this.store.selectSnapshot(StepsState.allSteps).some(step => step.name === SectionType.Ocr);

  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() continue = new EventEmitter();


  ngOnInit(): void {
    super.ngOnInit();

    this.analyticsFormService.initPaymentMethod(this.paymentMethod);

    this.loadStepperConfig();
  }

  public changePayment(data: ChangePaymentDataInterface): void {
    this.store.dispatch(new ChangeFailedPayment(data));
  }

  protected loadStepperConfig() {
    this.initialData = this.store.selectSnapshot(PaymentState.form);
    this.sectionsConfig = this.formConfigService.sectionsConfig(this.initialData, this.forceHideOcrPanel);
    this.cdr.detectChanges();
  }

  checkStepsLogic(formSectionsData: SectionDataInterface[]) {
    this.formSectionsData =
      this.formConfigService.checkStepsLogic(
        this.initialData?.detailsForm?.typeOfGuarantorRelation,
        formSectionsData,
        this.forceHideAddressPanel,
        this.forceHideOcrPanel,
      );
  }

  finishedModalShown(e: boolean) {
    this.continue.emit();
  }
}

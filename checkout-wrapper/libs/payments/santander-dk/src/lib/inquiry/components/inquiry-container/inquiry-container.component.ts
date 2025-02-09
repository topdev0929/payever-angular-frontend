import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Subject } from 'rxjs';

import {
  SectionDataInterface,
  SectionSchemeInterface,
} from '@pe/checkout/form-utils';
import { ChangeFailedPayment, PaymentState } from '@pe/checkout/store';
import { ChangePaymentDataInterface, FormOptionInterface } from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormConfigService,
  NodePaymentDetailsInterface,
  NodePaymentResponseDetailsInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {
  public formSectionsData: SectionDataInterface[] = [];
  public doSubmit$ = new Subject<void>();
  public sectionsConfig: SectionSchemeInterface[];

  private formConfigService: FormConfigService = this.injector.get(FormConfigService);

  @Input() isBillingAddressStepVisible = false;
  // For payment widgets when we have many payments in flow but behava like only one
  @Input() isDisableChangePayment = false;
  @Input() showCloseButton = false;

  @Output() continue = new EventEmitter();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    super.ngOnInit();

    this.nodeResult = this.nodeFlowService.getFinalResponse<NodePaymentResponseDetailsInterface>();
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);

    this.loadSectionsConfig();
  }

  protected loadSectionsConfig() {
    this.sectionsConfig = this.formConfigService.sectionsConfig();
    this.cdr.detectChanges();
  }

  public changePayment(data: ChangePaymentDataInterface): void {
    this.store.dispatch(new ChangeFailedPayment(data));
  }

  public onSubmit(): void {
    this.sendPaymentData();
  }

  protected sendPaymentData(): void {
    const formData = this.store.selectSnapshot(PaymentState.form);
    const nodePaymentDetails: NodePaymentDetailsInterface = prepareData(formData);

    const options = this.store.selectSnapshot(PaymentState.options);
    const carsFinancedTypes: FormOptionInterface[] = options.carsFinancedTypes;
    const cars = nodePaymentDetails.cars?.map((car) => {
      const type = carsFinancedTypes.find(option =>
        option.label.split('.').slice(-1)[0] === car.financedType)?.value as number;

      return {
        ...car,
        financedType: type || car.financedType,
      };
    });

    // Backend doesn't validate correctly when field is not shown
    //it is necessary because Object is not extensible
    const paymentDetails = {
      ...nodePaymentDetails,
      ...{
        wantsSafeInsurance: nodePaymentDetails.wantsSafeInsurance ?? false,
        insuranceForUnemployment: nodePaymentDetails.insuranceForUnemployment ?? false,
        payWithMainIncome: nodePaymentDetails.payWithMainIncome ?? false,
        wasCPRProcessed: nodePaymentDetails.wasCPRProcessed ?? false,
        wasTaxProcessed: nodePaymentDetails.wasTaxProcessed ?? false,
        children: nodePaymentDetails.children || [],
        cars: cars || [],
        purposeOfLoan: '',
        marketingSmsConsent: false,
        marketingEmailConsent: false,
        allowCreditStatusLookUp: false,
        childrenLivingHome: nodePaymentDetails.children?.length ?? 0,
        carsHousehold: nodePaymentDetails.cars?.length ?? 0,
        productConsent: nodePaymentDetails.productConsentOptOut!==true,
      },
    };

    this.nodeFlowService.setPaymentDetails(paymentDetails);

    this.continue.emit();
  }
}

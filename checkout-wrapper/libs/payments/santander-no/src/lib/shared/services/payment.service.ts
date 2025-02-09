import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import produce from 'immer';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { SectionStorageService } from '@pe/checkout/form-utils';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { PaymentState, SetPaymentComplete } from '@pe/checkout/store';
import {
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
} from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';

import { ScenarioEnum } from '../components';
import { FormInterface, NodePaymentDetailsInterface, NodePaymentResponseDetailsInterface } from '../types';

import { SantanderNoFlowService } from './santander-no-flow.service';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  @SelectSnapshot(PaymentState.response)
  private paymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;

  get needMoreInfoScenario(): boolean {
    return Object.values(ScenarioEnum).includes(
      this.paymentResponse?.payment?.specificStatus as any
    );
  }

  private nodeFlowService = this.injector.get(NodeFlowService);
  private topLocationService = this.injector.get(TopLocationService);
  private santanderNoFlowService = this.injector.get(SantanderNoFlowService);
  protected sectionStorageService = this.injector.get(SectionStorageService);

  protected preparePayment(formData: FormInterface): Observable<void> {
    const nodePaymentDetails = produce<NodePaymentDetailsInterface>(prepareData(formData), (draft: any) => {
      if (typeof draft.employmentPercent === 'string') {
        draft.employmentPercent = parseFloat(
          String(draft.employmentPercent)
        );
      }
      if (typeof draft.numberOfChildren === 'string') {
        draft.numberOfChildren = parseInt(
          String(draft.numberOfChildren),
          10
        );
      }

      draft.mortgageLoans = draft.mortgageLoans || [];
      draft.securedLoans = draft.securedLoans || [];
      draft.studentLoans = draft.studentLoans || [];
    });

    return this.nodeFlowService.assignPaymentDetails(nodePaymentDetails);
  }

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    if (!this.needMoreInfoScenario) {
      return of(null);
    }

    const formData = this.store.selectSnapshot(PaymentState.form);
    delete formData.currentStep;

    return this.preparePayment(formData).pipe(
      switchMap(() => this.santanderNoFlowService.getShopUrls()),
      switchMap(() => this.santanderNoFlowService.postMoreInfo<NodePaymentResponseDetailsInterface>().pipe(
        tap((nodePaymentResponse) => {
          if (nodePaymentResponse) {
            if (this.santanderNoFlowService.isNeedApproval(nodePaymentResponse)) {
              this.topLocationService.isRedirecting = true;
              this.sectionStorageService.isPassedPaymentData = false;
              this.store.dispatch([
                new SetPaymentComplete(false),
              ]);
            }
            if (nodePaymentResponse.payment?.specificStatus === PaymentSpecificStatusEnum.STATUS_APPROVED
              && nodePaymentResponse.paymentDetails?.applicantSignReferenceUrl
            ) {
              this.topLocationService.href = nodePaymentResponse.paymentDetails.applicantSignReferenceUrl;
            }
          }
        }),
      )),
    );
  }
}

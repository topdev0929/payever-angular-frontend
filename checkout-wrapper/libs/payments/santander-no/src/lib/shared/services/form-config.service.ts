import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SectionDataInterface, SectionSchemeInterface } from '@pe/checkout/form-utils';
import { NodeFlowService } from '@pe/checkout/node-api';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { InquireSectionConfig } from '../../inquiry/lazy-payment-sections.config';
import { NodePaymentResponseDetailsInterface } from '../types';

import { SantanderNoFlowService } from './santander-no-flow.service';

@Injectable()
export class FormConfigService {
  sectionsConfig(): SectionSchemeInterface[] {
    return [
      {
        name: InquireSectionConfig.Additional,
        title: $localize`:@@santander-no.inquiry.step.additional_info.title:`,
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.CreditZ,
        title: $localize`:@@santander-no.inquiry.step.proof_of_income.title:`,
        isButtonHidden: true,
      },
    ];
  }

  constructor(
    private santanderNoFlowService: SantanderNoFlowService,
    private nodeFlowService: NodeFlowService
  ) { }

  public checkStepsLogic(
    flowId: string,
    formSectionsData: SectionDataInterface[],
  ): Observable<SectionDataInterface[]> {
    if (!Array.isArray(formSectionsData)) {
      return of([]);
    }
    const nodeResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>
      = this.nodeFlowService.getFinalResponse();
    const disabledSettings = this.disabledSettings(nodeResponse);

    return of(formSectionsData.map((section: SectionDataInterface<InquireSectionConfig>) => {
      if (disabledSettings[section.name] !== undefined) {
        section.isDisabled = disabledSettings[section.name];
      }

      return section;
    }));
  }

  private disabledSettings(
    nodeResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>,
  ): { [key in InquireSectionConfig]?: boolean } {

    return {
      [InquireSectionConfig.CreditZ]: (nodeResponse
        ? !this.santanderNoFlowService.isNeedApproval(nodeResponse)
        : true
      ),
    };
  }
}

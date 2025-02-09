import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { SectionDataInterface, SectionSchemeInterface } from '@pe/checkout/form-utils';
import { NodeFlowService } from '@pe/checkout/node-api';
import { NodePaymentResponseInterface, SalesScoringType } from '@pe/checkout/types';

import {
  InquireSectionConfig,
  NodePaymentResponseDetailsInterface,
  SantanderSeApplicationResponse,
} from '../types';

import { SantanderSeFlowService } from './santander-se-flow.service';

@Injectable()
export class FormConfigService {

  constructor(
    private santanderSeFlowService: SantanderSeFlowService,
    private nodeFlowService: NodeFlowService
  ) {}

  sectionsConfig(): SectionSchemeInterface<InquireSectionConfig>[] {
    return [
      {
        name: InquireSectionConfig.InquireAml,
        title: $localize `:@@santander-se.inquiry.step.details.title:`,
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.InquireEba,
        title: $localize `:@@santander-se.inquiry.step.section.household_expenses.title:`,
        isButtonHidden: true,
      },
    ];
  }

  public checkStepsLogic(
    flowId: string,
    formSectionsData: SectionDataInterface[],
  ): Observable<SectionDataInterface[]> {
    if (!Array.isArray(formSectionsData)) {
      return of([]);
    }

    return this.santanderSeFlowService.getApplicationFromCache().pipe(
      map((application: SantanderSeApplicationResponse) => {

        const nodeResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>
          = this.nodeFlowService.getFinalResponse();
        const disabledSettings = this.disabledSettings(application, nodeResponse);

        return formSectionsData.map((section: SectionDataInterface<InquireSectionConfig>) => {
          if ( disabledSettings[section.name] !== undefined) {
            section.isDisabled = disabledSettings[section.name];
          }

          return section;
        });
      })
    );
  }

  private disabledSettings(
    application: SantanderSeApplicationResponse,
    nodeResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>,
  ): { [key in InquireSectionConfig]?: boolean } {
    const notAuthorized = application.salesScoringType === SalesScoringType.Authorization;

    return {
      [InquireSectionConfig.InquireAml]: notAuthorized,
      [InquireSectionConfig.InquireEba]: notAuthorized || (nodeResponse
        ? !this.santanderSeFlowService.isNeedMoreInfo(nodeResponse)
        : true
      ),
    };
  }
}

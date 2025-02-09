import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { EditPoliciesComponent } from '../../components/edit-policies/edit-policies.component';
import { PoliciesTypes, PolicyInterface } from '../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../services';
import { InfoBoxService } from '../../services/info-box.service';

@Component({
  selector: 'peb-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PoliciesComponent {

  policiesList = [
    {
      logo: '#icon-settings-policies-legal',
      itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.legal.title'),
      isActive: false,
      action: (e, detail) => {
        detail.isActive = true;
        this.openModal(detail, PoliciesTypes.legal);
      },
    },
    {
      logo: '#icon-settings-policies-disclaimer',
      itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.disclaimer.title'),
      isActive: false,
      action: (e, detail) => {
        detail.isActive = true;
        this.openModal(detail, PoliciesTypes.disclaimer);
      },
    },
    {
      logo: '#icon-settings-policies-refund',
      itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.refund_policy.title'),
      isActive: false,
      action: (e, detail) => {
        detail.isActive = true;
        this.openModal(detail, PoliciesTypes.refund_policy);
      },
    },
    {
      logo: '#icon-settings-policies-shipping',
      itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.shipping_policy.title'),
      isActive: false,
      action: (e, detail) => {
        detail.isActive = true;
        this.openModal(detail, PoliciesTypes.shipping_policy);
      },
    },
    {
      logo: '#icon-settings-policies-privacy',
      itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.privacy.title'),
      isActive: false,
      action: (e, detail) => {
        detail.isActive = true;
        this.openModal(detail, PoliciesTypes.privacy);
      },
    },
  ];

  listDataSubject = new BehaviorSubject(this.policiesList);

  resetHighlighted() {
    this.policiesList.forEach((item) => {
      item.isActive = false;
    });
    this.listDataSubject.next(this.policiesList);
  }

  constructor(
    private translateService: TranslateService,
    private infoBoxService: InfoBoxService,
    private envService: BusinessEnvService,
    private apiService: ApiService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  updateMethod = (data) => {
    const requestData: PolicyInterface = {
      business: {
        id: data.businessId,
      },
      content: data.text,
      type: data.type,
    };
    this.resetHighlighted();
    this.apiService.updatePolicy(data.businessId, data.type, requestData).pipe(takeUntil(this.destroy$)).subscribe();
  };

  openModal(detail, type) {
    this.apiService.getPolicy(this.envService.businessUuid, type)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.infoBoxService.openModal(
          this.infoBoxService.getObjectForModal(
            detail,
            EditPoliciesComponent,
            { type, content: res?.content || '' },
          ), this.updateMethod, () => this.resetHighlighted()
        );
      });
  }
}

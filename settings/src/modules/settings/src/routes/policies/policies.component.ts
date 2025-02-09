import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppThemeEnum } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { filter, pluck, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '../../components/abstract';
import { CloseWindowsConfirmationComponent } from '../../components/dialogs/exit-confirm/exit-confirm.component';
import { EditPoliciesComponent } from '../../components/edit-policies/edit-policies.component';
import { closeConfirmationQueryParam } from '../../misc/constants';
import { BusinessEnvService } from '../../index';
import { PoliciesTypes, PolicyInterface } from '../../misc/interfaces';
import { ApiService } from '../../services';
import { InfoBoxService } from '../../services/info-box.service';

@Component({
  selector: 'peb-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoliciesComponent extends AbstractComponent implements OnInit {
  theme = this.envService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  policiesList = [{
    logo: '#icon-settings-policies-legal',
    itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.legal.title'),
    action: (e, detail) => {
      this.openModal(detail, PoliciesTypes.legal);
    },
  }, {
    logo: '#icon-settings-policies-disclaimer',
    itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.disclaimer.title'),
    action: (e, detail) => {
      this.openModal(detail, PoliciesTypes.disclaimer);
    },
  }, {
    logo: '#icon-settings-policies-refund',
    itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.refund_policy.title'),
    action: (e, detail) => {
      this.openModal(detail, PoliciesTypes.refund_policy);
    },
  }, {
    logo: '#icon-settings-policies-shipping',
    itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.shipping_policy.title'),
    action: (e, detail) => {
      this.openModal(detail, PoliciesTypes.shipping_policy);
    },
  }, {
    logo: '#icon-settings-policies-privacy',
    itemName: this.translateService.translate('info_boxes.panels.policies.menu_list.privacy.title'),
    action: (e, detail) => {
      this.openModal(detail, PoliciesTypes.privacy);
    },
  }];
  constructor(
    private translateService: TranslateService,
    private infoBoxService: InfoBoxService,
    private envService: BusinessEnvService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private apiService: ApiService,
  ) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.queryParams.pipe(
      pluck(closeConfirmationQueryParam),
      filter(showDialog => !!showDialog),
      takeUntil(this.destroyed$),
    ).subscribe( () => {
      this.showConfirmationDialog('test');
    });
  }

  updateMethod = (data) => {
    const requestData: PolicyInterface = {
      business: {
        id: data.businessId,
      },
      content: data.text,
      type: data.type,
    };
    this.apiService.updatePolicy(data.businessId, data.type, requestData).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  showConfirmationDialog(data) {
    const dialogRef = this.dialog.open(CloseWindowsConfirmationComponent, {
      panelClass: [ 'settings-dialog', this.theme],
      data,
      hasBackdrop: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        if (result.exit) {
          this.infoBoxService.dialogRef.close();
        }
        this.router.navigate(['.'], {relativeTo: this.activatedRoute});
      });
  }

  openModal(detail, type) {
    this.apiService.getPolicy(this.envService.businessUuid, type)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: any) => {
        this.infoBoxService.openModal(
          this.infoBoxService.getObjectForModal(
            detail,
            EditPoliciesComponent,
            {type, content: res?.content || ''},
          ), this.theme, this.updateMethod,
        );
      });
  }
}

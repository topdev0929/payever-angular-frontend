import {ChangeDetectorRef, Component} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';


import {AbstractComponent} from '../../misc/abstract.component';
import { PeInvoiceSettingsEmailComponent } from '../../components/email/email.component';
import { PeInvoiceSettingsRemindersComponent } from '../../components/reminders/reminder.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n-core';
import { filter, tap } from 'rxjs/operators';
import { PeCreateInvoiceComponent } from '../../components/create-invoice/create-invoice.component';

@Component({
  selector: 'pe-invoice-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class PeInvoiceSettingsComponent extends AbstractComponent {
  theme =this.envService.businessData?.themeSettings?.theme? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  :AppThemeEnum.default;

  components = {
    emailSettings: {
      component:PeInvoiceSettingsEmailComponent,
      header: 'Email settings'
    },
    remindersSettings: {
      component:PeInvoiceSettingsRemindersComponent,
      header: 'Reminders'
    },
    createInvoice: {
      component:PeCreateInvoiceComponent,
      header: 'Create Invoice'
    },
  }

  constructor(
    private route: ActivatedRoute,
    private overlay: PeOverlayWidgetService,
    private messageBus:MessageBus,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private envService: EnvService,
  ) {
    super()
  }

  openOverlay(item, itemData?:any) {
    // const overlayData=itemData?itemData: this.openedSite;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component:item.component,
      data: {},
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: item.header,
        backBtnTitle: 'Cancel',
        theme: this.theme,
        backBtnCallback: () => { this.close()},
        cancelBtnTitle: '',
        cancelBtnCallback: () => { this.close()},
        doneBtnTitle: 'Done',
        doneBtnCallback: () => { },
      },
      backdropClick: () => {
        this.close();
      },
    }

    this.overlay.open(
      config
    )
  }

  close() {

    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      panelClass: 'pages-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        title: this.translateService.translate('invoice-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('invoice-app.dialogs.window_exit.label'),
        confirmButtonTitle: this.translateService.translate('invoice-app.dialogs.window_exit.confirm'),
        cancelButtonTitle: this.translateService.translate('invoice-app.dialogs.window_exit.decline'),
        theme: this.theme,
      },
    });

    dialogRef.afterClosed().pipe(
      filter(res => !!res),
      tap((res) => {
        this.overlay.close();
      }),
    ).subscribe();
  }

}

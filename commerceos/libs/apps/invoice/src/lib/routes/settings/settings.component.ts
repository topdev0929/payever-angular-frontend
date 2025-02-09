import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, tap } from 'rxjs/operators';

import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PeCreateInvoiceComponent } from '../../components/create-invoice/create-invoice.component';
import { PeInvoiceSettingsRemindersComponent } from '../../components/reminders/reminder.component';

@Component({
  selector: 'pe-invoice-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeInvoiceSettingsComponent  {

  components = {
    remindersSettings: {
      component: PeInvoiceSettingsRemindersComponent,
      header: 'Reminders',
    },
    createInvoice: {
      component: PeCreateInvoiceComponent,
      header: 'Create Invoice',
    },
  }

  constructor(
    private overlay: PeOverlayWidgetService,
    private dialog: MatDialog,
    private translateService: TranslateService,
  ) {
  }

  openOverlay(item) {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component:item.component,
      data: {},
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: item.header,
        backBtnTitle: 'Cancel',
        backBtnCallback: () => { this.close();},
        cancelBtnTitle: '',
        cancelBtnCallback: () => { this.close();},
        doneBtnTitle: 'Done',
        doneBtnCallback: () => { },
      },
      backdropClick: () => {
        this.close();
      },
    };

    this.overlay.open(
      config
    );
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

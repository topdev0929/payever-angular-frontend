import { Inject, Injectable } from '@angular/core';
import { AppThemeEnum, EnvService, MessageBus, TreeFilterNode } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { BehaviorSubject, EMPTY, forkJoin, Subject } from 'rxjs';
import { formatDate } from '@angular/common';0
import { INVOICE_NAVIGATION, invoiceOptions, filterOptions, InvoiceTreeDataInterface } from '../../constants';
import { DomSanitizer } from '@angular/platform-browser';
import { InvoiceEnvService } from '../../services/invoice-env.service';
import { catchError, finalize, take, tap } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { PebInvoiceSnackbarComponent } from '../../components/snackbar/snackbar.component';
import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class PebInvoiceGridService {
  private readonly invoiceFolders = invoiceOptions;
  private readonly invoiceFilters = filterOptions;
  isSidebarClosed$ = new BehaviorSubject(false);
  activeNode: TreeFilterNode;
  selectedItems: string[] = [];
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  callSubject = new Subject<any>();
  callObservable = this.callSubject.asObservable();
  settingsData = INVOICE_NAVIGATION;

  constructor(
    @Inject(EnvService) protected envService: InvoiceEnvService,
    private translateService: TranslateService,
    private mediaService: MediaService,
    private snackBar: MatSnackBar,
    private api: PeInvoiceApi,
    private store: Store,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private messageBus: MessageBus,
  ) {
  }

  public invoiceFolderToTreeItem(): TreeFilterNode<InvoiceTreeDataInterface>[] {
    return this.convertInvoiceToTreeItem(this.invoiceFolders);
  }

  public invoiceFilterToTreeItem(): TreeFilterNode<InvoiceTreeDataInterface>[] {
    return this.convertInvoiceToTreeItem(this.invoiceFilters);
  }

  folderToFolderMapper = (album) => {
    return {
      id: album.id,
      name: album.name,
      image: this.mediaService.getMediaUrl(album.icon, 'builder'),
      editing: false,
      parentId: album.parent,
      noToggleButton: false,
      children: [],
      data: {
        isFolder: true,
      },
    };
  }

  invoiceMapper = (invoice) => {
    const amount = (invoice.currency && invoice.amountPaid) ? `Amount: ${invoice.amountPaid} ${invoice.currency}` : '';
    const subtitle = invoice.issueDate ? `Date: ${formatDate(invoice.issueDate, 'M.d.yyyy', 'en')}`: '';
    const dueDate = invoice.dueDate ? `Date: ${formatDate(invoice.dueDate, 'M.d.yyyy', 'en')}`: '';
    invoice?.invoiceItems?.forEach(item => {
      if (typeof item === 'string') {
        item = { id: item };
        return;
      }
      item.id = item._id;
      item.images = item.images[0];
    });
    if (invoice?.customer?.contactId) {
      invoice.customer.id = invoice.customer.contactId;
    }
    return {
      id: invoice._id,
      title: invoice.reference,
      subtitle,
      createdAt: invoice.createdAt,
      status: invoice.status,
      description: amount,
      selected: false,
      labels: [invoice.status],
      image: invoice.picture ? this.mediaService.getMediaUrl(invoice.picture, 'builder') : './assets/icons/folder-grid.png',
      invoice: invoice,
      actions: [{
          label: this.translateService.translate('invoice-app.actions.edit'),
          actionClass: 'action',
          callback: () => {
            this.callSubject.next(invoice);
          },
        },
      ],
      customFields: [
        {
          content: subtitle
        },
        {
          content: dueDate
        },
        {
          content: amount
        },
        {
          content: invoice.status
        },
        // {
        //   content: this.sanitizer.bypassSecurityTrustHtml(`
        //         <button style="
        //           width: 51px;
        //           color:${this.theme === AppThemeEnum.light ? 'black;' : 'white;'}
        //           height: 24px;
        //           border-radius: 6px;
        //           background-color: ${this.theme === AppThemeEnum.light ? '#fafafa;' : 'rgba(255, 255, 255, 0.3);'}
        //           display:block;
        //           margin:auto;
        //           border:0;
        //           outline:0;
        //           float:right;
        //           cursor: pointer;
        //         ">Edit</button>
        //       `),
        //   callback: () => {
        //     this.messageBus.emit(`invoice.theme.open`, invoice.theme.id);
        //   },
        // },
      ],
    }
  }
  private convertInvoiceToTreeItem(folders): TreeFilterNode<InvoiceTreeDataInterface>[] {

    return folders.map(option => {
      const data: InvoiceTreeDataInterface = {
        isFolder: false,
        category: option.value
      };
      return {
        id: option.labelKey,
        name: this.translateService.translate(option.labelKey),
        imageSvg: option.image,
        editing: false,
        parentId: null,
        noToggleButton: true,
        data,
      }
    });
  }

  openSnackbar(text: string, success: boolean): MatSnackBarRef<any> {
    return this.snackBar.openFromComponent(PebInvoiceSnackbarComponent, {
      duration: 2000,
      verticalPosition: 'top',
      panelClass: 'mat-snackbar-shop-panel-class',
      data: {
        text,
        icon: success ? '#icon-snackbar-success' : '#icon-snackbar-error',
      },
    });
  }

  public onDuplicate(invoiceIds?: string[]) {
    return forkJoin(invoiceIds.map(invoiceId => this.api.duplicateInvoice(invoiceId)))
      .pipe(
        finalize(() => {
          this.selectedItems = [];
        }),
        tap((invoices) => {
          this.openSnackbar(this.translateService.translate('invoice-app.messages.invoice_duplicated'), true);

        }),
        catchError((err) => {
          this.openSnackbar(this.translateService.translate('invoice-app.messages.invoice_not_duplicated'), false);

          return EMPTY;
        }),
        take(1),
      )
  }

}

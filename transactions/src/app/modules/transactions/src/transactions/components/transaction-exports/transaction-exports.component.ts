import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '@pe/ng-kit/src/kit/auth/src/services/auth.service';
import { AbstractComponent } from '@pe/ng-kit/src/kit/common/src/components/abstract.component';
import { DataGridFilterInterface } from '@pe/ng-kit/src/kit/data-grid/src/interfaces/filter.interface';
import { DataGridTableColumnInterface } from '@pe/ng-kit/src/kit/data-grid/src/interfaces/table-column.interface';
import { groupBy, mapValues, omit } from 'lodash-es';
import { take } from 'rxjs/operators';
import { SearchTransactionsInterface } from '../../../shared/interfaces';
import { ApiService } from '../../../shared/services';
import { ExportFormats } from '../../common/entries';
@Component({
  selector: 'transaction-exports',
  templateUrl: 'transaction-exports.component.html',
  styleUrls: ['./transaction-exports.component.scss']

})
export class TransactionExportsComponent extends AbstractComponent {
  menuOpened: boolean;
  @Input() columns: DataGridTableColumnInterface[];
  @Input() filters: DataGridFilterInterface[];
  @Input() gridOrder: any;
  @Input() currency: string;
  @Input() searchValue: string;

  readonly ExportFormats: typeof ExportFormats = ExportFormats;

  constructor(
    private apiService: ApiService,
    private authService: AuthService) {
    super();
  }

  downloadFile(format: ExportFormats): void {
    // _.mapValues(_.groupBy(cars, 'make'),
    //   clist => clist.map(car => _.omit(car, 'make')));

    const searchData: SearchTransactionsInterface = {
      orderBy: this.gridOrder ? this.gridOrder.orderBy : undefined,
      direction: this.gridOrder ? this.gridOrder.direction : undefined,
      search: this.searchValue,
      currency: this.currency,
      configuration: mapValues(groupBy(this.filters, 'key'), filter => filter.map(key => omit(key, 'key')))
    };

    const activeColumns: DataGridTableColumnInterface[] = this.columns.filter(column => column.isActive);
    this.apiService.getBusinessData().subscribe(businessData => {
      this.apiService.exportTransactions(format, activeColumns, businessData.name, searchData)
        .subscribe((resp: HttpResponse<any>) => {
            let fileName: string;
            const contentDisposition: string = resp.headers.get('content-disposition');
            if (contentDisposition) {
              fileName = contentDisposition.substring(contentDisposition.indexOf('=') + 1);
            } else {
              fileName = `unnamed.${format}`;
            }
            if (window.navigator.msSaveOrOpenBlob) {
              // Internet Explorer
              window.navigator.msSaveOrOpenBlob(new Blob([resp.body], {type: resp.headers.get('content-type')}), fileName);
            } else {
              const el: HTMLAnchorElement = document.createElement('a');
              document.body.appendChild(el);
              el.href = window.URL.createObjectURL(resp.body);
              el.download = fileName;
              el.click();
              el.remove();
            }
          },
          error => {
            console.log(error);
          });

      // };
      // req.send();
    });
  }

}

import { AfterViewInit, Component, Inject, NgZone, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { EnvService } from '@pe/common';
import { InvoiceEnvService } from '../../../../services/invoice-env.service';
import { ProductsDialogService } from '../../../../services/products-dialog.service';


@Component({
  selector: 'peb-browse-products',
  templateUrl: './browse-products.component.html',
  styleUrls: ['./browse-products.component.scss'],

  encapsulation: ViewEncapsulation.None,
})
export class PeBrowseProductsFormComponent implements AfterViewInit {
  theme: string;
  @ViewChild(TemplateRef) ref;
  private dialogRef: any;

  constructor(
    @Inject(EnvService) private envService: InvoiceEnvService,
    public dialog: MatDialog,
    private router: Router,
    private productDialogService: ProductsDialogService,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    this.zone.run(() => {this.dialogRef = this.dialog.open(this.ref, {panelClass: 'product-add-overlay'})});
    this.dialogRef.afterClosed().subscribe((isSave: any) => {
      this.productDialogService.changeSaveStatus(isSave);
      this.close();
    });
  }

  closeProductDialog(): any {
    this.dialogRef.close(false);
  }

  addProductDialog(): any {
    this.dialogRef.close(true);
  }

  close() {
    this.router.navigate([`/business/${this.envService.businessId}/invoice`] );
  }
}

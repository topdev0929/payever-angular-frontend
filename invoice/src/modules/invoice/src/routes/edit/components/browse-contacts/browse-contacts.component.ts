import {
  AfterViewInit,
  Component,
  Inject,
  NgZone,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { EnvService } from '@pe/common';
import { ContactsDialogService } from '../../../../services/contacts-dialog.service';

import { InvoiceEnvService } from '../../../../services/invoice-env.service';

@Component({
  selector: 'peb-browse-contacts',
  templateUrl: './browse-contacts.component.html',
  styleUrls: ['./browse-contacts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PeBrowseContactsFormComponent implements AfterViewInit {
  theme: string;
  @ViewChild(TemplateRef) ref;
  private dialogRef: any;

  constructor(
    @Inject(EnvService) private envService: InvoiceEnvService,
    public dialog: MatDialog,
    private router: Router,
    private contactDialogService: ContactsDialogService,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    this.zone.run(() => {this.dialogRef = this.dialog.open(this.ref, {})});
    this.dialogRef.afterClosed().subscribe((isSave: any) => {
      this.contactDialogService.changeSaveStatus(isSave);
      this.close();
    });
  }

  closeContactDialog(): any {
    this.dialogRef.close(false);
  }

  addContactDialog(): any {
    this.dialogRef.close(true);
  }
  close() {
    this.router.navigate([`/business/${this.envService.businessId}/invoice`] );
  }
}

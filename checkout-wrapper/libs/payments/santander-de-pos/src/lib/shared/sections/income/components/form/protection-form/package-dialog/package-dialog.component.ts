import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { DialogComponentInterface, DialogRef } from '@pe/checkout/dialog';
import { ParamsState } from '@pe/checkout/store';

import { InformationPackageInterface } from '../interfaces';

export interface DataInterface {
  informationPackage: InformationPackageInterface,
}

@Component({
  selector: 'pe-insurance-package-dialog',
  templateUrl: './package-dialog.component.html',
  styleUrls: ['./package-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsurancePackageDialogComponent implements DialogComponentInterface {
  @SelectSnapshot(ParamsState.merchantMode) public merchantMode!: boolean;

  dialogRef: DialogRef<InsurancePackageDialogComponent>;

  public readonly informationPackageObject = this.merchantMode
    ? this.data.informationPackage.merchant
    : this.data.informationPackage.selfService;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DataInterface,
  ) {
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDataGridLayoutType } from '@pe/common';

import { DataGridService } from '../../services/data-grid/data-grid.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pf-edit-menu',
  templateUrl: 'edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMenuComponent implements OnInit {

  item: any;

  theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private dataGridService: DataGridService,
    private pebEnvService: PebEnvService,
  ) {
  }

  ngOnInit() {}

  edit() {
    if (this.item?.data?.isFolder) {
      this.dataGridService.collectionEdit(this.item.id);
    } else {
      this.dataGridService.productEdit(this.item.id);
    }
  }

  delete() {
    if (this.item?.data?.isFolder) {
      this.dataGridService.deleteSelected([this.item.id], [], PeDataGridLayoutType.List);
    } else {
      this.dataGridService.deleteSelected([], [this.item.id], PeDataGridLayoutType.List);
    }
  }

}

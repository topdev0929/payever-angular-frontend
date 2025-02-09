import { MatPaginatorIntl } from '@angular/material/paginator';

import { TranslateService } from '../../i18n';

export class PeMatPaginatorIntl extends MatPaginatorIntl {

  nextPageLabel: string = '';
  previousPageLabel: string = '';

  itemsPerPageLabel: string = this.translateService.translate('ng_kit.data_grid.pagination.items_per_page');

  constructor(private translateService: TranslateService) {
    super();
  }

  /**
   * Copy of material logic with custom translations
   */
  getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return this.translateService.translate('ng_kit.data_grid.pagination.range', {range: '0', total: length});
    }

    length = Math.max(length, 0);

    const startIndex: number = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex: number = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return this.translateService.translate('ng_kit.data_grid.pagination.range', {
      range: `${startIndex + 1} - ${endIndex}`,
      total: length
    });
  }

}

import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import { peVariables } from '../../pe-variables';

import { GridGutterSizeType } from './interfaces';

@Component({
  selector: 'pe-grid',
  templateUrl: 'grid.component.html'
})
export class GridComponent {

  @ContentChild(TemplateRef, { static: true }) tileTemplateRef: TemplateRef<any>;
  @ContentChild('DefaultTile', { static: true }) defaultTileTemplateRef: TemplateRef<any>;

  @Input()
  set gutterSize(gutterSizeSetting: GridGutterSizeType) {
    switch (gutterSizeSetting) {
      case this.gutterSizeSettings.Small:
        this.gutter = `${peVariables.toNumber('gridUnitX')}px`;
        break;
      case this.gutterSizeSettings.Large:
        this.gutter = `${peVariables.toNumber('gridUnitX') * 3}px`;
        break;
      default:
        this.gutter = peVariables['gridUnitX'] as string;
    }
  };
  @Input() items: any[];
  @Input() itemsPerRow: number = 4;
  @Input() hasPadding: boolean = true;
  @Input() rowHeight: string = '1:1';

  @Output() itemClicked: EventEmitter<void> = new EventEmitter<void>();

  gutter: string = peVariables['gridUnitX'] as string;
  gutterSizeSettings: typeof GridGutterSizeType = GridGutterSizeType;

}

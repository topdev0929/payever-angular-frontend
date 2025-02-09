import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SkinInterface, SkinEventInterface, SkinUploadEventInterface, SkinWidgetConfigInterface } from '../../skin-widget.interfaces';

@Component({
  selector: 'pe-skin-widget',
  templateUrl: './skin-widget.component.html',
  styleUrls: ['./skin-widget.component.scss']
})
export class SkinWidgetComponent {

  @Input() config: SkinWidgetConfigInterface = null;

  @Input()
  set loading(isLoading: boolean) {
    this.isLoading = isLoading;
  }
  @Input()
  set customSkinsItems(data: SkinInterface[]) {
    this.customSkins = data;
  }
  @Input()
  set presetSkinsItems(data: SkinInterface[]) {
    this.presetSkins = data;
  }

  @Input() isPresetRemoveEnabled: boolean = false;

  @Output() skinItemClicked: EventEmitter<SkinEventInterface> = new EventEmitter();
  @Output() deleteSkinItemClicked: EventEmitter<SkinEventInterface> = new EventEmitter();
  @Output() uploadSkinItemClicked: EventEmitter<SkinUploadEventInterface> = new EventEmitter();
  @Output() closed: EventEmitter<null> = new EventEmitter();

  customSkins: SkinInterface[];
  presetSkins: SkinInterface[];

  isLoading: boolean = false;

}

import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SkinInterface, SkinEventInterface } from '../../skin-widget.interfaces';

@Component({
  selector: 'pe-skin-widget-item',
  templateUrl: './skin-widget-item.component.html'
})
export class SkinWidgetItemComponent {

  @Input() isPresetRemoveEnabled: boolean = false;
  @Input() isPreset: boolean = false;

  @Input() skins: SkinInterface[];

  @Output() skinItemClicked: EventEmitter<SkinEventInterface> = new EventEmitter();
  @Output() deleteSkinItemClicked: EventEmitter<SkinEventInterface> = new EventEmitter();

  onSkinClick(skinItem: SkinInterface): void {
    this.skinItemClicked.emit({
      uuid: skinItem.uuid,
      isPreset: this.isPreset,
      isPresetRemoveEnabled: this.isPresetRemoveEnabled
    });
  }

  onSkinDelete(event: MouseEvent, skinItem: SkinInterface): void {
    event.stopPropagation();
    this.deleteSkinItemClicked.emit({
      uuid: skinItem.uuid,
      isPreset: this.isPreset,
      isPresetRemoveEnabled: this.isPresetRemoveEnabled
    });
  }

}

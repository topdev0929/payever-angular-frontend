import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RowAddonInterface } from '../../interfaces';

/**
 * @deprecated Should be removed after migration to fieldset
 */
@Component({
  selector: 'pe-form-row-addon',
  templateUrl: 'row-addon.component.depr.html'
})
export class FormRowAddonComponent {

  @Input() addon: RowAddonInterface;
  @Output() clickAddon: EventEmitter<null> = new EventEmitter();

  get iconClass(): string {
    let size: string = null;
    if ( this.addon.iconSize ) {
      size = `-${this.addon.iconSize}`;
    }
    else {
      size = /-[0-9]+$/.exec(this.addon.iconId)[0];
    }
    return size ? `icon icon${size}` : '';
  }

  get iconId(): string {
    return `#${this.addon.iconId}`;
  }

  onClickAddon(event: Event): void {
    this.clickAddon.emit();
    event.preventDefault();
  }
}

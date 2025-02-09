import { Component, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { SubheaderInterface } from '../../interfaces';

@Component({
  selector: 'pe-sidenav-subheader-buttons',
  templateUrl: 'sidenav-subheader-buttons.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SidenavSubheaderButtonsComponent {
  @Input() classNames: string;
  @Input() activeButton: string;
  @Input() buttons: SubheaderInterface;
  @Output() onClickButton: EventEmitter<any> = new EventEmitter<any>();

  onClick(view: string): void {
    this.onClickButton.emit(view);
  }
}

import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { NavbarControlType, NavbarControlPosition } from '../../../../deprecated/enums';
import {
  LinkControlInterface,
  NavbarControlInterface,
  TextControlInterface,
} from '../../../../deprecated/interfaces';

@Component({
  selector: 'pe-overlay-container',
  templateUrl: './overlay-container.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./overlay-container.component.scss'],
})
export class OverlayContainerComponent implements OnInit {

  @Input() specialCardClass: string;
  @Input() contentScrollable = true;
  @Input() icon: string;
  @Input() title: string;
  @Input() showHeader = true;
  @Input() showSpinner: boolean;
  @Input() withPadding: boolean;
  @Input() set headerControls(controls: NavbarControlInterface[]) {
    this.headerControlsValue = controls;
    this.controls = controls;
  }

  get headerControls(): NavbarControlInterface[] {
    return this.headerControlsValue;
  }

  @Input() notFullwidthOnMobile = false;
  @Input() fullHeight = false;
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  @HostBinding('class.fullsize') @Input() fullSize = false;
  @HostBinding('class.full-screen') @Input() fullScreenWidth = false;
  @HostBinding('class.pe-overlay-container') hostClass = true;

  controls: NavbarControlInterface[];

  strokeWidth = 2;
  diameter = 32;

  private headerControlsValue: NavbarControlInterface[];

  private get defaultControls(): NavbarControlInterface[] {
    return [
      {
        position: NavbarControlPosition.Center,
        type: NavbarControlType.Text,
        iconPrepend: this.icon,
        iconPrependSize: 24,
        text: this.title,
      } as TextControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-x-24',
        iconPrependSize: 16,
        onClick: () => this.closeEvent.emit(),
        classes: 'mat-button-no-padding',
      } as LinkControlInterface,
    ];
  }

  ngOnInit(): void {
    if ( !this.headerControls ) {
      this.controls = this.defaultControls;
    }
  }
}

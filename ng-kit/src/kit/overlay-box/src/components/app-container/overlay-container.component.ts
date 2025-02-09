import { Component, EventEmitter, HostBinding, Input, Output, ViewEncapsulation } from '@angular/core';
import { NavbarControlPosition, NavbarControlType } from '../../../../navbar/src/enums';
import { LinkControlInterface, NavbarControlInterface, TextControlInterface } from '../../../../navbar/src/interfaces';
import { SpinnerConfig } from '../../../../spinner';

@Component({
  selector: 'pe-overlay-container',
  templateUrl: './overlay-container.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./overlay-container.component.scss'],
})
export class OverlayContainerComponent {

  @Input() specialCardClass: string;
  @Input() contentScrollable: boolean = true;
  @Input() icon: string;
  @Input() title: string;
  @Input() showHeader: boolean = true;
  @Input() showSpinner: boolean;
  @Input() withPadding: boolean;
  @Input() set headerControls(controls: NavbarControlInterface[]) {
    this.headerControlsValue = controls;
    this.controls = controls;
  }
  get headerControls(): NavbarControlInterface[] {
    return this.headerControlsValue;
  }
  @Input() notFullwidthOnMobile: boolean = false;
  @Input() fullHeight: boolean = false;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  @HostBinding('class.fullsize') @Input() fullSize: boolean = false;
  @HostBinding('class.full-screen') @Input() fullScreenWidth: boolean = false;
  @HostBinding('class.pe-overlay-container') hostClass: boolean = true;

  controls: NavbarControlInterface[];
  spinnerConfig: SpinnerConfig = SpinnerConfig;

  private headerControlsValue: NavbarControlInterface[];

  private get defaultControls(): NavbarControlInterface[] {
    return [
      {
        position: NavbarControlPosition.Center,
        type: NavbarControlType.Text,
        iconPrepend: this.icon,
        iconPrependSize: 24,
        text: this.title
      } as TextControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-x-24',
        iconPrependSize: 16,
        onClick: () => this.onClose.emit(),
        classes: 'mat-button-no-padding'
      } as LinkControlInterface
    ];
  }

  ngOnInit(): void {
    if ( !this.headerControls ) {
      this.controls = this.defaultControls;
    }
  }
}

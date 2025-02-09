import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatformService } from '../../../../common';
import { LinkControlInterface, NavbarControlInterface, NavbarControlPosition, NavbarControlType, TextControlInterface } from '../../../../navbar';
import { SpinnerConfig } from '../../../../spinner';

import { WindowService } from '../../../../window';

@Component({
  selector: 'pe-info-box',
  templateUrl: 'info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
})
export class InfoBoxComponent {

  @Input() hasAvatar: boolean = false;

  /**
   * @deprecated
   */
  @Input() blurBackdrop: boolean = false;
  @Input() backdropFilterBlur: boolean = false;
  @HostBinding('class.pe-info-box-large') @Input() large: boolean = false;
  @HostBinding('class.pe-info-box-fixed') @Input() fixed: boolean = true;
  @Input() withPadding: boolean = false;
  @Input() containerBased: boolean = false;
  @Input() contentScrollable: boolean = false;
  @Input() withHeader: boolean = true;
  @Input() withFooter: boolean = true;
  @Input() transparent: boolean = false;
  @Input() set showSpinner(show: boolean) {
    this.loading$.next(show);
  }
  /**
   * @deprecated
   */
  @Input() blurred: boolean = true;

  /**
   * @deprecated
   */
  @Input() background: string;
  @Input() transparentFooter: boolean;
  @Input() title: string;
  @Input() roundBorder: boolean;
  @Input() notFullwidthOnMobile: boolean;
  @Input() noBackgroundColor: boolean;
  @Input() alignTitle: 'left' | 'center' = 'left';

  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  @HostBinding('class.pe-info-box') hostClasses: boolean = true;

  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  needMargin$: Observable<boolean>;

  headerControls: NavbarControlInterface[];
  needMargin: boolean;
  spinnerConfig: SpinnerConfig = SpinnerConfig;

  constructor(
    private platformService: PlatformService,
    private windowService: WindowService
  ) {}

  ngOnInit(): void {
    this.needMargin$ = combineLatest(
      this.windowService.height$,
      this.windowService.scrollHeight$
    ).pipe(
      map((data: [ number, number]) => {
        if (this.needMargin && (data[1] - data[0] < screen.height * 0.4)) {
          this.needMargin = false;
          return false;
        }
        this.needMargin = data[1] > data[0];
        return data[1] > data[0];
      }));

    this.headerControls = [
      {
        position: this.alignTitle === 'left' ? NavbarControlPosition.Left : NavbarControlPosition.Center,
        text: this.title,
        type: NavbarControlType.Text
      } as TextControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-x-16',
        iconPrependSize: 16,
        onClick: () => this.onClose.emit(),
        classes: 'mat-button-no-padding'
      } as LinkControlInterface
    ];
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  NavbarControlPosition,
  NavbarControlType,
  NavbarPosition,
  NavbarColor,
  NavbarStyle,
  TextControlInterface,
  NavbarControl
} from '../../../../../../kit/navbar';
import { PlatfromHeaderLinkControlInterface, PlatfromHeaderMenuControlInterface, PlatfromHeaderInterface, PlatformHeaderService } from '../../../../../../kit/platform-header';

const APP_DETAILS_TEXT = 'Checkout';
const APP_DETAILS_ICON = 'icon-apps-payments';
const MICRO_CODE: string = 'checkout';

@Component({
  selector: 'doc-platform-header-example',
  templateUrl: 'platform-header-example.component.html',
  styleUrls: ['../../navbar-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformHeaderExampleComponent implements OnInit {

  color: NavbarColor = NavbarColor.DuskyLight;
  position: NavbarPosition = NavbarPosition.FixedTop;
  style: NavbarStyle = NavbarStyle.Transparent;

  showBadConnectionAlert$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  connectionControls: NavbarControl[] = [
    {
      text: 'You have some problems with internet connection',
      position: NavbarControlPosition.Center,
      type: NavbarControlType.Text,
      iconPrepend: 'icon-warning-20',
      iconPrependSize: 16
    } as TextControlInterface
  ];
  constructor(private platformHeaderService: PlatformHeaderService) {}

  ngOnInit(): void {
    const controls = [
      {
        type: NavbarControlType.Link,
        title: 'Test point',
        initiallySelected: true
      } as PlatfromHeaderLinkControlInterface,
      {
        type: NavbarControlType.Menu,
        position: NavbarControlPosition.Right,
        icon: 'icon-dots-h-24',
        iconSize: 24,
        menuItems: this.getDropdownItems(),
        notSelectable: true,
        classes: 'mat-button-fit-content',
        uniqueName: 'shop-menu',
      } as PlatfromHeaderMenuControlInterface,
    ];

    const platformHeader: PlatfromHeaderInterface = {
      microCode: MICRO_CODE,
      appDetails: {
        text: APP_DETAILS_TEXT,
        icon: APP_DETAILS_ICON
      },
      closeConfig: {
        showClose: true
      },
      controls: controls
    };
    setTimeout(() => {
      this.platformHeaderService.setPlatformHeader(platformHeader);
      // this.platformService.microAppReady = 'checkout';
    });
  }

  private getDropdownItems(): any[] {
    const dropdownElements: any[] = [];
      dropdownElements.push({
        title: 'Copy link',
        icon: 'icon-link3-16',
        iconSize: 16,
        callbackId: this.platformHeaderService.registerCallback(() => {
          alert('Copy link');
        })
      });
    dropdownElements.push({
      title: 'Copy with prefilled data',
      icon: 'icon-link3-16',
      iconSize: 16,
      callbackId: this.platformHeaderService.registerCallback(() => {
        alert('Copy with prefilled data');
      })
    });
    dropdownElements.push({
      title: 'E-mail link',
      icon: 'icon-contact',
      iconSize: 16,
      callbackId: this.platformHeaderService.registerCallback(() => {
        alert('E-mail link');
      })
    });
    return dropdownElements;
  }
}

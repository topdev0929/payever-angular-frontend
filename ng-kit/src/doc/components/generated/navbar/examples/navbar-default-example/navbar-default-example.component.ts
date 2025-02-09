import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  NavbarControlInterface,
  MenuControlInterface,
  DividerControlInterface,
  NavbarControlPosition,
  NavbarControlType,
  NavbarPosition,
  NavbarColor,
  NavbarStyle,
  LinkControlInterface,
  TextControlInterface,
  NavbarControl
} from '../../../../../../kit/navbar';

@Component({
  selector: 'doc-navbar-default-example',
  templateUrl: 'navbar-default-example.component.html',
  styleUrls: ['../../navbar-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarDefaultExampleComponent implements OnInit {

  controls: NavbarControl[];
  position: NavbarPosition = NavbarPosition.Default;
  color: NavbarColor = NavbarColor.Dark;
  style: NavbarStyle = NavbarStyle.Default;
  currentPage: BehaviorSubject<string> = new BehaviorSubject<string>('Home page');
  currentDevice: BehaviorSubject<string> = new BehaviorSubject<string>('icon-device-desktop-24');
  editMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.controls = [
      combineLatest(this.currentDevice, this.editMode).pipe(map((data: [string, boolean]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Menu,
          iconAppend: 'icon-dropdown-triangle-16',
          iconPrepend: data[0],
          hidden: data[1],
          classes: 'mat-menu-xs mat-menu-light',
          menuItems: [
            {
              iconAppend: 'icon-device-desktop-24',
              onClick: () => this.currentDevice.next('icon-device-desktop-24')
            },
            {
              iconAppend: 'icon-device-tablet-24',
              onClick: () => this.currentDevice.next('icon-device-tablet-24')
            },
            {
              iconAppend: 'icon-device-mobile-24',
              onClick: () => this.currentDevice.next('icon-device-mobile-24')
            }
          ]
        } as MenuControlInterface
      })),
      combineLatest(this.editMode).pipe(map((data: [boolean]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Divider,
          fullHeight: true,
          hidden: data[0]
        } as DividerControlInterface
      })),
      combineLatest(this.currentPage, this.editMode).pipe(map((data: [string, boolean]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Menu,
          iconAppend: 'icon-dropdown-triangle-16',
          text: data[0],
          hidden: data[1],
          iconPrepend: 'icon-home-page-24',
          menuItems: [
            {
              text: 'Home page',
              onClick: () => this.currentPage.next('Home page')
            },
            {
              text: 'About page',
              onClick: () => this.currentPage.next('About page')
            }
          ]
        } as MenuControlInterface
      })),
      combineLatest(this.editMode).pipe(map((data: [boolean]) => {
        return {
          position: NavbarControlPosition.Center,
          type: NavbarControlType.Menu,
          iconAppend: 'icon-dropdown-triangle-16',
          iconPrepend: 'icon-apps-apps',
          iconPrependSize: 24,
          hidden: data[0],
          menuItems: [
            {
              text: 'Store'
            },
            {
              text: 'Products'
            }
          ]
        } as MenuControlInterface
      })),
      combineLatest(this.editMode).pipe(map((data: [boolean]) => {
        return {
          position: NavbarControlPosition.Center,
          type: NavbarControlType.Text,
          text: 'You are editing header',
          hidden: !data[0]
        } as LinkControlInterface
      })),
      combineLatest(this.editMode).pipe(map((data: [boolean]) => {
        return {
          position: NavbarControlPosition.Right,
          type: NavbarControlType.Text,
          color: 'primary',
          text: 'Done',
          iconPrepend: 'icon-home-page-24',
          hidden: data[0],
        } as TextControlInterface
      }))
    ];
  }

  toggleEditMode(): void {
    this.editMode.pipe(take(1)).subscribe((isEdit: boolean) => {
      this.editMode.next(!isEdit);
    })
  }
}

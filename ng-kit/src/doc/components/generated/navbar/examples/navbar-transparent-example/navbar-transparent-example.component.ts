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
  LinkControlInterface,
  NavbarStyle,
  NavbarControl
} from '../../../../../../kit/navbar';

@Component({
  selector: 'doc-navbar-transparent-example',
  templateUrl: 'navbar-transparent-example.component.html',
  styles: [`
    :host {
      display: block;
      background-image:url(https://www.walldevil.com/wallpapers/a85/backgrounds-high-resolution-blurred-background1-blur-light-blue.jpg);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarTransparentExampleComponent implements OnInit {

  areaClasses: Map<NavbarControlPosition, string> = new Map<NavbarControlPosition, string>();
  controls: NavbarControl[];
  position: NavbarPosition = NavbarPosition.Default;
  color: NavbarColor = NavbarColor.Dark;
  style: NavbarStyle = NavbarStyle.Transparent;
  currentPage: BehaviorSubject<string> = new BehaviorSubject<string>('Home page');
  currentDevice: BehaviorSubject<string> = new BehaviorSubject<string>('icon-device-desktop-24');

  ngOnInit(): void {
    this.areaClasses.set(NavbarControlPosition.Center, 'mat-toolbar-area-tools');

    this.controls = [
      {
        position: NavbarControlPosition.Left,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-arrow-left-small-16',
        text: 'Back to Dashboard',
        onClick: () => {
          alert('"Back to Dashboard" clicked')
        }
      } as LinkControlInterface,
      {
        position: NavbarControlPosition.Center,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-themes-64',
        iconPrependSize: 16,
        text: 'Themes',
        onClick: () => {
          alert('"Themes" clicked')
        }
      } as LinkControlInterface,
      {
        position: NavbarControlPosition.Center,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-plus-solid-32',
        iconPrependSize: 16,
        text: 'Add',
        onClick: () => {
          alert('"Add" clicked')
        }
      } as LinkControlInterface,
      {
        position: NavbarControlPosition.Center,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-settings-sliders-32',
        iconPrependSize: 16,
        text: 'Settings',
        onClick: () => {
          alert('"Settings" clicked')
        }
      } as LinkControlInterface,
      combineLatest(this.currentPage).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Right,
          type: NavbarControlType.Menu,
          iconAppend: 'icon-dropdown-triangle-16',
          text: data[0],
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
      combineLatest(this.currentDevice).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Right,
          type: NavbarControlType.Menu,
          iconAppend: 'icon-dropdown-triangle-16',
          iconPrepend: data[0],
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
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-fullscreen-16',
        classes: 'mat-icon-button',
        onClick: () => {
          alert('"Full screen" clicked')
        }
      } as LinkControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-undo-16',
        classes: 'mat-icon-button',
        onClick: () => {
          alert('"Undo" clicked')
        }
      } as LinkControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-redo-16',
        classes: 'mat-icon-button',
        onClick: () => {
          alert('"Redo" clicked')
        }
      } as LinkControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        iconPrepend: 'icon-combined-shape-16',
        classes: 'mat-icon-button',
        onClick: () => {
          alert('"Save" clicked')
        }
      } as LinkControlInterface,
      {
        position: NavbarControlPosition.Right,
        type: NavbarControlType.Link,
        text: 'Publish',
        onClick: () => {
          alert('"Publish" clicked')
        }
      } as LinkControlInterface
    ];
  }
}

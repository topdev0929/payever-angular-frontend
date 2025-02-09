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
  selector: 'doc-navbar-micro-example',
  templateUrl: 'navbar-micro-example.component.html',
  styleUrls: ['../../navbar-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarMicroExampleComponent implements OnInit {

  controls: NavbarControl[];
  position: NavbarPosition = NavbarPosition.Default;
  color: NavbarColor = NavbarColor.DuskyLight;
  style: NavbarStyle = NavbarStyle.Transparent;

  currentApp: BehaviorSubject<string> = new BehaviorSubject<string>('icon-apps-pos');

  ngOnInit(): void {
    this.controls = [
      combineLatest(this.currentApp).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Text,
          iconPrepend: data[0],
          iconPrependSize: 16,
          text: 'Points of Sale Apps',
          classes: 'mat-toolbar-micro-app-title',
        } as TextControlInterface
      })),
      combineLatest(this.currentApp).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Link,
          text: 'Terminal 1',
          onClick: () => {
            alert('"Save" clicked')
          }
        } as LinkControlInterface
      })),
      combineLatest(this.currentApp).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Link,
          text: 'Themes',
          onClick: () => {
            alert('"Themes" clicked')
          }
        } as LinkControlInterface
      })),
      combineLatest(this.currentApp).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Link,
          text: 'Transactions',
          onClick: () => {
            alert('"Products" clicked')
          }
        } as LinkControlInterface
      })),
      combineLatest(this.currentApp).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Link,
          text: 'Products',
          onClick: () => {
            alert('"Products" clicked')
          }
        } as LinkControlInterface
      })),
      combineLatest(this.currentApp).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Link,
          text: 'Checkout',
          onClick: () => {
            alert('"Checkout" clicked')
          }
        } as LinkControlInterface
      })),
      combineLatest(this.currentApp).pipe(map((data: [string]) => {
        return {
          position: NavbarControlPosition.Left,
          type: NavbarControlType.Link,
          text: 'Settings',
          shortcutKey: 'g',
          tooltipText: 'press (g)',
          onClick: () => {
            alert('"Settings" clicked')
          }
        } as LinkControlInterface
      }))
    ];
  }

}

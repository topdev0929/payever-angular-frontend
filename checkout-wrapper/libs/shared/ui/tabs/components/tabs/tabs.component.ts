import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';

import { Tab } from '../../models';
import { CheckoutUiTabComponent } from '../tab';


@Component({
  selector: 'ui-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutUiTabsComponent implements AfterContentInit {
  @ContentChildren(CheckoutUiTabComponent) tabs: QueryList<CheckoutUiTabComponent>;

  @Input() activeTabIndex: number;

  @Input() position: 'center' | 'stretched' = 'center';

  @Output() tabChange = new EventEmitter<Tab>();

  ngAfterContentInit(): void {
    if (this.activeTabIndex !== undefined) {
      this.tabSelectionChange(this.tabs.toArray()[this.activeTabIndex], this.activeTabIndex);
    }
  }

  tabSelectionChange(tab: Tab, index: number): void {
    this.tabs.forEach((t, i) => t.active = i === index);
    index !== undefined && this.tabChange.emit(tab);
  }
}

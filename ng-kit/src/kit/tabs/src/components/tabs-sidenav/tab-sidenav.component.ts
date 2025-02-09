import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { TabsSidenavConfigInterface } from '../../interfaces';

@Component({
  selector: 'pe-tab-sidenav',
  templateUrl: 'tab-sidenav.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TabSidenavComponent {
  @Input() tabs: TabsSidenavConfigInterface[];
  @Input() selectedIndex: number;
  @Output() onTabChange: EventEmitter<number> = new EventEmitter();

  tabChanged(index: number): void {
    this.onTabChange.emit(index);
  }
}

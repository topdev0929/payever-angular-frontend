import { Component, Input, OnDestroy, OnInit } from '@angular/core';

// NOTE: Keep this path as is to avoid compilation error because of
// circular dependency
import { LayoutTabsetComponent } from '../layout-tabset/layout-tabset.component';

@Component({
  selector: 'pe-layout-tab',
  styleUrls: ['layout-tab.component.scss'],
  templateUrl: './layout-tab.component.html'
})
export class LayoutTabComponent implements OnInit, OnDestroy {

  @Input() link: string;
  @Input() svgIcon: string;
  @Input() pngIcon: string;
  @Input() noIconShadow: boolean;

  active: boolean = false;

  constructor(
    private tabset: LayoutTabsetComponent
  ) {}

  ngOnInit(): void {
    this.tabset.addTab(this);
  }

  async onTabClick(evt: MouseEvent): Promise<void> {
    evt.preventDefault();
    await this.tabset.selectTab(this);
  }

  ngOnDestroy(): void {
    this.tabset.removeTab(this);
  }
}

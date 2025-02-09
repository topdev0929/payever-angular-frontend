import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { DevModeService } from '../../../../dev';

// NOTE: Keep this path as is to avoid compilation error because of
// circular dependency'
import { LayoutTabComponent } from '../layout-tab/layout-tab.component';

@Component({
  selector: 'pe-layout-tabset',
  styleUrls: ['layout-tabset.component.scss'],
  templateUrl: './layout-tabset.component.html'
})
export class LayoutTabsetComponent implements OnInit {

  @Input() noPadding: boolean;

  tabs: BehaviorSubject<LayoutTabComponent[]> = new BehaviorSubject([]);

  constructor(
    private router: Router,
    private devMode: DevModeService,
  ) {}

  ngOnInit(): void {
    this.tabs
      .pipe(
        filter(({ length }) => length > 0),
        first()
      )
      .subscribe(
        ([firstTab]) => this.selectTab(firstTab)
      );
  }

  addTab(tab: LayoutTabComponent): void {
    this.tabs.next(
      [...this.tabs.getValue(), tab]
    );
  }

  removeTab(tab: LayoutTabComponent): void {
    this.tabs.next(
      this.tabs.getValue().filter(tabItem => tabItem !== tab)
    );
  }

  async selectTab({ link }: LayoutTabComponent): Promise<void> {
    const wasNavigated: boolean = await this.router
      .navigateByUrl(link)
      .catch(() => false);
    if (wasNavigated) {
      this.tabs.getValue().map(
        tabItem => tabItem.active = tabItem.link === link,
      );
    } else if (this.devMode.isDevMode()) {
      // tslint:disable-next-line no-console
      console.warn(`LayoutTabsetComponent#selectTab() failed because router dont know ${link} link`);
    }
  }
}

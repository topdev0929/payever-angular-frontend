import {
  AfterContentInit,
  Component,
  ContentChildren,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebInspectorState, PebSetInspectorAction, PebSecondaryTab, PebInspectorStateModel } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebEditorTabComponent } from './tab.component';

@Component({
  selector: 'peb-editor-sidebar-tabs',
  template: `
    <div class="tabs peb-tabs">
      <div class="tabs__wrapper">
        <div
          class="tab"
          *ngFor="let tab of tabs; let index = index"
          (click)="selectTab(tab, index)"
          [class.active]="tab.active"
          [hidden]="tab.hidden"
        >
          {{ tab.title }}
        </div>
      </div>
    </div>
    <div class="tab__wrapper">
      <div class="tab-content scrollbar" pebAutoHideScrollBar>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./tabs.component.scss'],
  providers: [PeDestroyService],
})
export class PebEditorTabsComponent implements AfterContentInit, OnChanges {
  @Select(PebInspectorState.inspector) inspectorSidebar$!: Observable<PebInspectorStateModel>;

  @Input() activeTabIndex = 0;

  @ContentChildren(PebEditorTabComponent) tabs: QueryList<PebEditorTabComponent>;

  constructor(private readonly destroy$: PeDestroyService, private readonly store: Store) {}

  ngAfterContentInit() {
    this.inspectorSidebar$.pipe(
      tap(({ secondaryTab }) => {
        const tabs = this.tabs.toArray();
        
        tabs.forEach((t: PebEditorTabComponent) => t.active = false);
        const activeTab = tabs.find(tab => tab.title.toLowerCase() === secondaryTab?.toLowerCase());
        
        if (activeTab) {
          activeTab.active = true;
        } else {
          tabs[this.activeTabIndex].active = true;
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.activeTabIndex?.currentValue && this.tabs) {
      this.selectTab(this.tabs.toArray()[changes.activeTabIndex.currentValue]);
    }
  }

  selectTab(tab: PebEditorTabComponent, index?: number): void {
    this.store.dispatch(
      new PebSetInspectorAction({
        secondaryTab: tab.title.toLowerCase() as PebSecondaryTab,
      }),
    );
  }
}

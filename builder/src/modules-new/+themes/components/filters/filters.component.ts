import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AbstractComponent } from '@pe/builder-core';
import { ThemeCategoryInterface } from '../../routes/list-all/list-all.component';

interface FilterFlatNode {
  expandable: boolean;
  name: string;
  id: string;
  level: number;
  isExpanded?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'pe-builder-theme-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeFiltersComponent extends AbstractComponent {
  @Input() set filters(sources: ThemeCategoryInterface[]) {
    if (!sources) {
      return;
    }

    const updatedFilters = this.getFiltersFromSources(sources);
    this.updatedFilterSourcesSubject$.next(updatedFilters);
    this.initialFilterSourcesSubject$.next(updatedFilters);
  }

  @Input() opened: boolean;
  @Input() set activeFilter(value: string) {
    this.activeFilterSubject$.next(value);
  }
  @Output() toggled = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<string>();

  initialFilterSourcesSubject$ = new BehaviorSubject<any[]>(null);
  updatedFilterSourcesSubject$ = new BehaviorSubject<any[]>(null);
  activeFilterSubject$ = new BehaviorSubject<string>(null);

  treeControl = new FlatTreeControl<FilterFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  onFilterClick(filter: FilterFlatNode): void {
    this.selected.emit(filter.id);
    this.activeFilterSubject$.next(this.activeFilterSubject$.value === filter.id ? null : filter.id);
  }

  toggleFilters(): void {
    this.toggled.emit(!this.opened);
  }

  hasChildFilters = (_: number, node: FilterFlatNode) => node.expandable;

  getParentFilterNode(node: FilterFlatNode): FilterFlatNode {
    const nodeIndex = this.initialFilterSourcesSubject$.value.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.initialFilterSourcesSubject$.value[i].level === node.level - 1) {
        return this.initialFilterSourcesSubject$.value[i];
      }
    }

    return null;
  }

  isActiveFilter(node: FilterFlatNode): boolean {
    return this.activeFilterSubject$.value === node.id;
  }

  // isDisabledFilter(node: FilterFlatNode): boolean {
  //   return !this.updatedFilterSourcesSubject$.value.find(
  //     n => n.name === node.name && n.level === node.level,
  //   ) && !this.isActiveFilter(node);
  // }

  shouldRender(node: FilterFlatNode): boolean {
    const parent = this.getParentFilterNode(node);

    return !parent || parent.isExpanded;
  }

  isFirstOfTypeParentNode(node: FilterFlatNode): boolean {
    const filters: FilterFlatNode[] = this.initialFilterSourcesSubject$.value;
    const currentIndex = filters.findIndex(f => f.level === node.level && f.name === node.name);

    return currentIndex === 0;
  }

  isLastOfTypeChildNode(node: FilterFlatNode): boolean {
    const filters: FilterFlatNode[] = this.initialFilterSourcesSubject$.value;
    const currentIndex = filters.findIndex(f => f.level === node.level && f.name === node.name);

    return !filters[currentIndex + 1] || filters[currentIndex + 1].level === 0;
  }

  // tslint:disable-next-line: prefer-function-over-method
  private getFiltersFromSources(sources: ThemeCategoryInterface[]): FilterFlatNode[] {
    return sources.reduce((acc, curr) => ([
      ...acc,
      {
        expandable: true,
        name: curr.name,
        id: curr._id,
        level: 0,
        isExpanded: false,
      },
      ...(curr.children ? curr.children.map(child => ({
        expandable: false,
        name: child.name,
        id: child._id,
        level: 1,
        disabled: !child.themeCount,
      })) : []),
    ]), []);
  }

}

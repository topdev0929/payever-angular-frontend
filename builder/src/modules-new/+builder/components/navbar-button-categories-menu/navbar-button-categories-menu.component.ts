import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { parseTestAttribute } from '../../../core/utils';
import { NavbarCategoryData } from '../../entities/navbar';

@Component({
  selector: 'pe-builder-navbar-button-categories-menu',
  templateUrl: './navbar-button-categories-menu.component.html',
  styleUrls: ['./navbar-button-categories-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarButtonCategoriesMenuComponent implements OnInit {

  @Input() data: NavbarCategoryData[] = [];
  @Output() readonly itemClicked: EventEmitter<any> = new EventEmitter();

  selectedCategorySubject$ = new BehaviorSubject<NavbarCategoryData>(this.data[0]);
  readonly selectedCategory$: Observable<NavbarCategoryData> = this.selectedCategorySubject$.asObservable();

  ngOnInit(): void {
    if (this.data.length) {
      this.selectedCategory = this.data[0];
    }
  }

  getTestingAttribute(val: string): string {
    return parseTestAttribute(val);
  }

  set selectedCategory(category: any) {
    this.selectedCategorySubject$.next(category);
  }

  get selectedCategory(): any {
    return this.selectedCategorySubject$.getValue();
  }

  onItemClicked(item: any): void {
    this.itemClicked.emit(item);
    if (typeof item.onClick === 'function') {
      item.onClick();
    }
  }
}

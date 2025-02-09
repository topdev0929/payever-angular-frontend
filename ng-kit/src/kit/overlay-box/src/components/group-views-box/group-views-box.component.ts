import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

import { WindowService } from '../../../../window/src/services';
import { CustomControlInterface } from '../../../../navbar/src/interfaces';
import { NavbarControlPosition, NavbarControlType } from '../../../../navbar/src/enums';
import { NavbarControl } from '../../../../navbar/src/types';
import { GroupViewsBoxSidebarCategoryInterface, GroupViewsBoxViewInterface } from '../../interfaces';

@Component({
  selector: 'pe-group-views-box',
  templateUrl: './group-views-box.component.html',
  styleUrls: ['./group-views-box.component.scss']
})
export class GroupViewsBoxComponent {

  @ViewChild('headerButtons', { static: true }) headerButtons: TemplateRef<any>;

  @Input() content: TemplateRef<any>;
  @Input() views: GroupViewsBoxViewInterface[];
  @Input() selectedViewIndex: number = 0;
  @Input() showSidebar: boolean;
  @Input() sidebarCategories: GroupViewsBoxSidebarCategoryInterface[] = [];
  @Input() categoryTranslationKey: string = '';
  @Input() showSpinner: boolean = false;
  @Input() overlayContainerFullScreen: boolean = false;

  @Output() readonly viewChanged: EventEmitter<MatButtonToggleChange> = new EventEmitter<MatButtonToggleChange>();
  @Output() readonly sidebarCategorySelected: EventEmitter<number> = new EventEmitter<number>();

  isMobile$: Observable<boolean> = this.windowService.isMobile$;
  headerControls: NavbarControl[];
  selectedSidebarCategory: number = 0;

  constructor(private windowService: WindowService) {}

  ngOnInit(): void {
    this.headerControls = [
      {
        position: NavbarControlPosition.Center,
        type: NavbarControlType.Custom,
        content: this.headerButtons
      } as CustomControlInterface
    ];
  }

  selectSidebarCategory(index: number): void {
    this.selectedSidebarCategory = index;
    this.sidebarCategorySelected.emit(index);
  }
}

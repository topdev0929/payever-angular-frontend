import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { PeDataGridFilterItem, PeDataGridItem } from '@pe/common';
import { PeDataGridComponent } from '@pe/data-grid';

import { ProgramEntity } from '../../../../api/subscription/subscription.api.interface';
import { HeaderService } from '../../../../services/header.service';
import { PeSubscriptionSidebarService } from '../../../../services/sidebar.service';
import { AbstractComponent } from '../../../../shared/abstract';
import { WarningSnackbarComponent } from '../../../../shared/components/warning-snackbar/warning-snackbar.component';
import { Direction } from '../../../../shared/enums/direction.enum';
import { Order } from '../../../../shared/interfaces/order.interface';
import { PesProgramDto } from '../../dto/program.dto';
import { ProgramsDataGridService } from '../../services/programs-data-grid.service';
import { PesProgramsService } from '../../services/programs.service';

import { plainToClass } from 'class-transformer';

@Component({
  selector: 'pe-subscriptions-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [ProgramsDataGridService, PesProgramsService],
})
export class PeProgramsComponent extends AbstractComponent implements OnInit, AfterViewInit {
  addProgramButton: PeDataGridItem = {
    title: 'Add Program',
    actions: [this.dataGridService.addAction],
  };

  @ViewChild('programDataGrid', { static: true }) dataGrid: PeDataGridComponent;

  constructor(
    public programsService: PesProgramsService,
    public dataGridService: ProgramsDataGridService,
    private cdr: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    public headerService: HeaderService,
    private sidebarService: PeSubscriptionSidebarService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.programsService.loadPrograms().pipe(take(1)).subscribe();

    this.programsService.programs$
      .pipe(
        tap((programs: any) => {
          const gridItems = this.createGridItems(programs);
          this.dataGridService.gridItems = gridItems;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.dataGridService.allFilters$
      .pipe(
        debounceTime(100),
        skip(1),
        switchMap(() => {
          this.programsService.patchPagination({
            page: 1,
          });
          return this.programsService.loadPrograms();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    merge(
      this.programsService.searchString$.pipe(distinctUntilChanged()).pipe(skip(1)),
      this.programsService.order$.pipe(
        skip(1),
        distinctUntilChanged((order1, order2) => order1.by === order2.by && order1.direction === order2.direction),
      ),
    )
      .pipe(
        withLatestFrom(this.dataGridService.allFilters$),
        switchMap(([sortSearch, filters]) => {
          if (typeof sortSearch === 'string') {
            this.dataGridService.gridItems = this.createGridItems(
              this.filterItems(this.programsService.programs, sortSearch),
            );
            return this.dataGridService.gridItems;
          }
          return this.sortItems(this.dataGridService.gridItems, sortSearch);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.programsService.pagination$
      .pipe(
        skip(2),
        map(pagination => pagination.page),
        distinctUntilChanged(),
      )
      .pipe(
        withLatestFrom(this.dataGridService.allFilters$),
        switchMap(([page, filters]) => this.programsService.loadPrograms()),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.dataGridService.groupFiltersFormGroup.valueChanges.subscribe(() => {
      this.snackbar.openFromComponent(WarningSnackbarComponent, {
        data: { text: 'Group filtering not implemented yet. ' },
        panelClass: 'mat-snackbar-shop-panel-class',
        duration: 3000,
        verticalPosition: 'bottom',
      });
    });
  }

  ngAfterViewInit() {
    this.dataGrid.initAnimation = true;
  }

  onFiltersChanged(filterItems: PeDataGridFilterItem[]) {
    if (filterItems === null && this.dataGridService.conditionFormattedFilters.length) {
      this.resetPrograms().pipe(take(1)).subscribe();
    }
  }

  onSearchChanged(searchString: string) {
    this.programsService.searchString = searchString;
  }

  onSelectedItemsChanged(ids: string[]) {
    this.dataGridService.selectedPrograms = ids;
  }

  layoutChanged(evt: any) {
    if (evt === 'list') {
      const currentPrograms = this.dataGridService.gridItems;
      this.dataGridService.gridItems = [];
      setTimeout(() => {
        this.dataGridService.gridItems = [...currentPrograms];
      }, 500);
    }
  }
  scrollOnBottom(evt: any) {}

  private resetPrograms(): Observable<ProgramEntity[]> {
    this.dataGridService.conditionFormattedFilters = [];
    this.dataGridService.filtersFormGroup.get('tree').patchValue([]);
    return this.programsService.resetPrograms();
  }

  private sortItems(items: any[], order: Order) {
    if (order.direction === Direction.ASC) {
      return items.sort((a, b) => (a[order.by] < b[order.by] ? -1 : 1));
    }
    return items.sort((a, b) => (a[order.by] > b[order.by] ? -1 : 1));
  }

  private filterItems(items: ProgramEntity[], text: string) {

    const filtered = items.filter((item: any) => {
      const title = item.name.toLowerCase();
      const searchInput = text.toLowerCase();

      return title.indexOf(searchInput) > -1;
    });


    return filtered;
  }

  private createGridItems(items: ProgramEntity[]) {
    return items
      .map(program =>
        plainToClass(PesProgramDto, {
          ...program,
          image: this.programsService.createListImageCanvas(program.name.charAt(0)),
          selected: false,
        }),
      );
  }

  onToggleSidebar(e) {
    this.sidebarService.toggleSidebar();
  }
}

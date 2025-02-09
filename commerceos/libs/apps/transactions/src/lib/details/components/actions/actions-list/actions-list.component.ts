/* eslint-disable no-underscore-dangle */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Actions, Store, ofActionCompleted } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { cloneDeep } from 'lodash';
import { Subject, merge } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { SettingsService } from '../../../../services/settings.service';
import { DetailInterface } from '../../../../shared';
import { UIActionInterface } from '../../../../shared/interfaces/action.interface';
import { ActionsListService, MAX_MAIN } from '../../../services/actions-list.service';
import { DetailsState, GetDetails } from '../../../store';
import { MoreActionsComponent } from '../more/more.component';


@Component({
  selector: 'pe-actions-list',
  template: `
    <pe-actions-container
      [uiActions]="mainActions"
      typeView="column"
      [isShowMore]="optionalActions?.length"
      [moreIcon]="moreIcon"
      (selected)="onSelected($event)"
      (clickMore)="openMoreActions()"
    ></pe-actions-container>
  `,
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsListComponent implements OnInit {
  @SelectSnapshot(DetailsState.order) public order: DetailInterface;

  @Output() refresh: EventEmitter<void> = new EventEmitter<void>();

  optionalActions: UIActionInterface[] = [];
  mainActions: UIActionInterface[];
  isReadyToGetActions = false;

  onSelectedSubject$ = new Subject<number>();

  constructor(
    private cdr: ChangeDetectorRef,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
    private overlay: PeOverlayWidgetService,
    private actionsListService: ActionsListService,
    private store: Store,
    private actions: Actions,
  ) {
  }

  onSelected(actionIndex: number): void {
    this.mainActions[actionIndex].onClick();
  }

  ngOnInit(): void {
    this.isReadyToGetActions = true;

    const selectedSubject$ = this.onSelectedSubject$.pipe(
      tap((actionIndex: number) => {
        if (this.optionalActions[actionIndex]) {
          this.optionalActions[actionIndex].onClick();
        }
      })
    );

    const detailServiceLoading$ = this.actions.pipe(
      filter(() => !this.settingsService.isPersonal && !this.settingsService.isAdmin),
      ofActionCompleted(GetDetails),
      switchMap(() => this.store.selectOnce(DetailsState.order)),
      tap((order) => {
        this.prepareActionsForUI(order);
      })
    );

    const selectOrder$ = this.store.select(DetailsState.order).pipe(
      tap((order) => {
        this.prepareActionsForUI(order, true);
      })
    );

    merge(
      selectedSubject$,
      detailServiceLoading$,
      selectOrder$,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  openMoreActions(): void {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: MoreActionsComponent,
      data: { uiActions: this.optionalActions, onSelected$: this.onSelectedSubject$ },
      backdropClass: 'settings-backdrop',
      panelClass: 'more-widget-panel',
      headerConfig: {
        title: this.translateService.translate('transactions.details.actions.more'),
        backBtnTitle: this.translateService.translate('transactions.actions.cancel'),
        doneBtnTitle: this.translateService.translate('transactions.actions.done'),
      },
    };

    this.overlay.open(
      config,
    );
  }

  get moreIcon() {
    return this.actionsListService.getCDNIcon('more');
  }

  private prepareActionsForUI(order: DetailInterface, disableSkeleton?: boolean): void {
    const actionsEnabled = this.store.selectSnapshot(DetailsState.actionsEnabled);

    if (disableSkeleton) {
      this.mainActions = [];
    }

    if (!this.isReadyToGetActions || !order) {
      return;
    }

    if (actionsEnabled?.length) {
      let uiActions: UIActionInterface[] = [];
      const { mainActions, optionalActions } = this.actionsListService.actionsMapper(actionsEnabled, order);

      if (mainActions?.length > MAX_MAIN) {
        this.mainActions = cloneDeep(mainActions).slice(0, MAX_MAIN);
        uiActions = cloneDeep(mainActions).slice(MAX_MAIN);
      } else {
        this.mainActions = mainActions;
      }

      uiActions = [...uiActions, ...optionalActions];

      this.optionalActions = uiActions;
      this.cdr.markForCheck();
    }
  }
}

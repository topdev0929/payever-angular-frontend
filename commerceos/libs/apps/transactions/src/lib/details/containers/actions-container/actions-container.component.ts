import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { ActionTypeUIEnum } from '../../../shared/enums/action-type.enum';
import { UIActionInterface } from '../../../shared/interfaces/action.interface';
import { TransactionState } from '../../store';
import { FadeInAnimation } from '../skeleton';

import { ActionsContainerService } from './actions-container.service';


@Component({
  selector: 'pe-actions-container',
  templateUrl: './actions-container.component.html',
  styleUrls: ['./actions-container.component.scss'],
  providers: [
    ActionsContainerService,
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FadeInAnimation],
})
export class ActionsListContainerComponent {
  @Input() isShowMore = false;
  @Input() moreIcon: string;
  @Input() typeView: 'column' | 'row' = 'row';
  @Input() set uiActions(actions: UIActionInterface[]) {
    this.actionsSubject$.next(actions);
  }

  @Output() selected = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();
  @Output() clickMore = new EventEmitter<void>();

  ActionTypeUIEnum: typeof ActionTypeUIEnum = ActionTypeUIEnum;

  private actionsSubject$ = new BehaviorSubject<UIActionInterface[]>([]);
  actions$ = this.actionsSubject$.pipe(
    switchMap(actions => this.store.select(TransactionState.runtimeActions).pipe(
      map((runtimeActions) => {
        return this.actionsContainerService.toggleHidden(runtimeActions, actions);
      })
    ))
  )

  constructor(
    private actionsContainerService: ActionsContainerService,
    private destroyed$: PeDestroyService,
    private store: Store
  ) {
    this.actionsContainerService.closed$
    .pipe(
      tap(() => this.closed.emit()),
      takeUntil(this.destroyed$)
    )
    .subscribe();
  }

  trackByFn(index: number, item: UIActionInterface): string {
    return item?.labelTranslated ?? item.label;
  }

  onSelected(actionIndex: number): void {
    this.selected.emit(actionIndex);
  }

  onClickLink(e: Event, action: UIActionInterface): void {
    e.preventDefault();

    action.showConfirm
      ? this.actionsContainerService.showConfirm(action)
      : this.actionsContainerService.downloadByLink(action.href, action?.errorMessage, action.onClick);
  }
}

import { Component, Input, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PeOverlayWidgetService } from '@pe/overlay-widget';


import { Action, ACTION_LIST } from '../../../models/rules.model';

@Component({
  selector: 'pe-rule-action-list',
  templateUrl: './rule-action-list.component.html',
  styleUrls: ['./rule-action-list.component.scss'],
  providers: [PeDestroyService],
})
export class RuleActionListComponent implements OnInit {
  @Input()
  embeddedMode = false;

  @Input()
  actionList: Action[] = ACTION_LIST;

  @Output()
  addAction = new EventEmitter<Action>();

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    private overlayWidgetService: PeOverlayWidgetService,
    private readonly destroyed$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    !this.embeddedMode && this.overlayConfig.onSaveSubject$.pipe(
      skip(1),
      tap(() => this.overlayWidgetService.close()),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  selectAction(action: Action) {
    if (action.disabled) {
      return;
    }

    this.embeddedMode? this.addAction.emit(action)
      : this.overlayConfig.onSaveSubject$.next(action);
  }
}

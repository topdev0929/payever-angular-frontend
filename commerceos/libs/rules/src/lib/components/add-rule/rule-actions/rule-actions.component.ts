import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { EMPTY, BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PeOverlayWidgetService, OverlayHeaderConfig } from '@pe/overlay-widget';

import { Action } from '../../../models/rules.model';
import { RuleActionListComponent } from '../rule-action-list/rule-action-list.component';

@Component({
  selector: 'pe-rule-actions',
  templateUrl: './rule-actions.component.html',
  styleUrls: ['./rule-actions.component.scss'],
  providers: [PeDestroyService],
})
export class RuleActionsComponent implements OnInit {
  @Output()
  addAction = new EventEmitter<Action>();

  private addAction$ = new BehaviorSubject<Action>(null);

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private overlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    this.addAction$
    .pipe(
      skip(1),
      tap((action: Action) => {
        this.addAction.emit(action);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  addNewAction() {
    const headerConfig = {
      title: this.translateService.translate(`rules.choose-action`),
      backBtnTitle: this.translateService.translate('rules.cancel'),
      backBtnCallback: () => {
        this.overlayWidgetService.close();
      },
      doneBtnTitle: this.translateService.translate('rules.done'),
      doneBtnCallback: () => {
        this.overlayWidgetService.close();
      },
      onSaveSubject$: this.addAction$,
    } as OverlayHeaderConfig;
    this.overlayWidgetService.open({
      headerConfig,
      data: {
      },
      panelClass: 'add-rule-overlay-panel',
      component: RuleActionListComponent,
      // lazyLoadedModule: RulesModule,
      backdropClick: () => {
        return EMPTY;
      },
    });
  }
}

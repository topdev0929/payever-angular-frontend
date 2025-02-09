import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnDestroy,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BusinessInterface } from '@pe/business';
import { MessageBus } from '@pe/common';
import { RulesService, RuleObservableService } from '@pe/rules';
import { PeSimpleStepperService } from '@pe/stepper';
import { BusinessState } from '@pe/user';

import { PeStatisticsHeaderService } from '../statistics-header.service';

@Component({
  selector: 'cos-next-statistics-root',
  templateUrl: './next-statistics-root.component.html',
  styleUrls: ['./next-statistics-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextStatisticsRootComponent implements OnInit, OnDestroy, AfterViewInit {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface

  body: HTMLElement = document.body;
  unsubscribe$ = new Subject();


  constructor(
    public router: Router,
    public peSimpleStepperService: PeSimpleStepperService,
    private statisticsHeaderService: PeStatisticsHeaderService,
    private messageBus: MessageBus,
    private rulesService: RulesService,
    private ruleObservableService: RuleObservableService,
  ) { }

  ngOnInit() {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
      'settings',
      'statistics',
    ]);

    this.initRuleListener();
  }

  ngAfterViewInit() {
    this.statisticsHeaderService.initialize();
  }

  private initRuleListener() {
    this.messageBus.listen('open-rule')
      .pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        this.rulesService.show(new BehaviorSubject(null), data);
      });
    this.ruleObservableService.actions$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((actionsList) => {
        if (actionsList?.length) {
          this.messageBus.emit('rule-actions-list', actionsList);
        }
      });
  }

  ngOnDestroy() {
    this.statisticsHeaderService.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

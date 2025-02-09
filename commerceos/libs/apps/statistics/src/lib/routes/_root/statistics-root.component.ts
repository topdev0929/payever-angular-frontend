import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { StatisticsHeaderService } from '../../infrastructure';

@Component({
  selector: 'pe-statistics',
  templateUrl: './statistics-root.component.html',
  styleUrls: ['./statistics-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsComponent implements OnInit, OnDestroy {

  protected destroy$ = new Subject<void>();

  /** Whether translation is ready or not */
  translationsReady$ = new BehaviorSubject(false);

  constructor(
    private headerService: StatisticsHeaderService,
  ) {
  }

  ngOnInit(): void {
    this.headerService.init();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}

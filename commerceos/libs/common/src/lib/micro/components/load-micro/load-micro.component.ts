import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NodeJsFrontendConfigInterface } from '../../../environment-config';
import { MicroLoaderService } from '../../services';

/* @deprecated */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-load-micro',
  templateUrl: 'load-micro.component.html',
})
export class LoadMicroComponent implements OnInit, OnDestroy {

  @Input() set micro(micro: keyof NodeJsFrontendConfigInterface) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadBuild(micro).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }

  @Input() set innerMicro(data: { micro: keyof NodeJsFrontendConfigInterface, innerMicro: string, subPath: string} ) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadInnerMicroBuildEx(data.micro, data.innerMicro, data.subPath).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }

  @Input() set bootstrapScriptUrl(bootstrapScriptUrl: string) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadMicroByScriptUrl(bootstrapScriptUrl).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }

  @Input() isShowLoader = true;
  @Output() isLoading = new EventEmitter<boolean>();

  isLoadingSubject = new BehaviorSubject(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(
    private microLoader: MicroLoaderService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$.pipe(takeUntil(this.destroyed$)).subscribe((isLoading) => {
      this.isLoading.next(isLoading);
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

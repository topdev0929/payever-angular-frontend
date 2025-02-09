import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MicroLoaderService } from '../../services';
import { AbstractComponent } from '../../../../common/src/components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-load-micro',
  templateUrl: 'load-micro.component.html'
})
export class LoadMicroComponent extends AbstractComponent implements OnInit {

  @Input('micro') set setMicro(micro: string) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadBuild(micro).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }
  @Input('innerMicro') set setInnerMicro(data: {micro: string, innerMicro: string}) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadInnerMicroBuild(data.micro, data.innerMicro).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }

  @Input() isShowLoader: boolean = true;
  @Output('isLoading') isLoadingEmitter: EventEmitter<boolean> = new EventEmitter();

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor(
    private microLoader: MicroLoaderService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isLoading$.pipe(takeUntil(this.destroyed$)).subscribe(isLoading => {
      this.isLoadingEmitter.next(isLoading);
    });
  }
}

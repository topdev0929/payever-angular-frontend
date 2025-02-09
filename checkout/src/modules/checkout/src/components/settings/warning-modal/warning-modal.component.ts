import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Subject, } from 'rxjs';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

@Component({
  selector: 'warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WarningModalComponent implements OnInit, OnDestroy {

  onCancel: BehaviorSubject<number> = this.overlayData.onCancel;
  onSuccess: BehaviorSubject<number> = this.overlayData.onSuccess;

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {}

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleClose(): void {
    this.onCancel.next(1);
  }

  handleOpen(): void {
    this.onSuccess.next(1);
  }
}

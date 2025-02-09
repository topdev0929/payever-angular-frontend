
import {takeUntil} from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { ReplaySubject } from 'rxjs';


import { SkinUploadEventInterface, SkinWidgetConfigInterface } from '../../skin-widget.interfaces';
import { SkinWidgetService } from '../../skin-widget.service';

@Component({
  selector: 'pe-skin-widget-upload',
  templateUrl: './skin-widget-upload.component.html'
})
export class SkinWidgetUploadComponent implements OnInit, OnDestroy {

  @Input() isPreset: boolean = false;
  @Input() config: SkinWidgetConfigInterface;

  @Output() uploadButtonClicked: EventEmitter<SkinUploadEventInterface> = new EventEmitter();

  isFileUploading: boolean = false;
  isFileUploadingFailed: boolean = false;

  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private uiSkinWidgetService: SkinWidgetService) {}

  ngOnInit(): void {
    this.uiSkinWidgetService.fileUploading$().pipe(
      takeUntil(this.destroyed$))
      .subscribe((value: boolean) => {
        this.isFileUploading = value;
      });
    this.uiSkinWidgetService.fileUploadingFailed$().pipe(
      takeUntil(this.destroyed$))
      .subscribe((value: boolean) => {
        this.isFileUploadingFailed = value;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onFileChanged(event: Event): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      this.uploadButtonClicked.emit({
        isPreset: this.isPreset,
        file: target.files[0]
      });
    }
  }

}

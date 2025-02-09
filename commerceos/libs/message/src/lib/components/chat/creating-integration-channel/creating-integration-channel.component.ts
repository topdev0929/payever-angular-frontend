import { HttpEventType } from '@angular/common/http';
import {
  Component, ChangeDetectionStrategy, Inject, ChangeDetectorRef,
  SecurityContext, Output, EventEmitter, OnInit,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { tap, takeUntil, filter } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  PeMessageImgTypes,
  PeMessageApiService,
  PeMessageAppService,
} from '@pe/message/shared';
import { PE_OVERLAY_CONFIG, PeOverlayRef } from '@pe/overlay-widget';
import { FileUploadTypes } from '@pe/shared/chat';


@Component({
  selector: 'pe-creating-integrations-channel',
  templateUrl: './creating-integration-channel.component.html',
  styleUrls: ['./creating-integration-channel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeCreatingIntegrationChannelComponent implements OnInit {
  onSave$ = this.overlayConfig.onSave$.pipe(takeUntil(this.destroyed$));
  onSaveSubject$ = this.overlayConfig.onSaveSubject$;

  @Output() goBack = new EventEmitter<void>();

  imgDropTypes = [
    PeMessageImgTypes.png,
    PeMessageImgTypes.jpeg,
    PeMessageImgTypes.gif,
    PeMessageImgTypes.svg,
  ];

  mainInfoGroup = this.formBuilder.group({
    title: [null, Validators.required],
    description: [],
    photo: [],
  });

  avatar: SafeUrl | null = null;

  errors = {
    title: {
      hasError: false,
      errorMessage: '',
    },
  };

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private peMessageApiService: PeMessageApiService,
    private domSanitizer: DomSanitizer,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
    private peMessageAppService: PeMessageAppService,
    @Inject(PE_ENV) private environmentConfigInterface: EnvironmentConfigInterface,
  ) { }

  ngOnInit(): void {
    this.onSave$.pipe(filter(val => !!val)).pipe(
      tap((dialogRef: PeOverlayRef) => {
        if (this.mainInfoGroup.valid) {
          this.overlayConfig.doneBtnTitle = this.translateService.translate("message-app.sidebar.loading");
          const payload = { ...this.mainInfoGroup.value, contacts: [], subType: 'public' };
          this.peMessageApiService.postChannel(payload).pipe(
            tap((channel) => {
              this.peMessageApiService.toggleChannelLiveStatus(channel, true).pipe(
                tap((liveChannel) => {
                  this.overlayConfig.doneBtnTitle =
                    this.translateService.translate("message-app.sidebar.create");
                  this.peMessageAppService.addChannel(liveChannel);
                  dialogRef.close();
                }),
                takeUntil(this.destroyed$),
              ).subscribe();
            }),
            takeUntil(this.destroyed$),
          ).subscribe();
        }
        else {
          this.checkErrors('title');
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  changeAvatar(files: FileList): void {
    const file = files[0];

    if (file && this.imgDropTypes.includes(file.type as PeMessageImgTypes)) {
      this.peMessageApiService.postMedia(file, FileUploadTypes.Image).pipe(
        tap((event) => {
          if (event.type === HttpEventType.Response) {
            this.avatar = this.domSanitizer.sanitize(
              SecurityContext.URL,
              `${this.environmentConfigInterface.custom.storage}/message/${event.body.blobName}`
            );
            this.mainInfoGroup.patchValue({
              photo: event.body.blobName,
            });

            this.changeDetectorRef.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

  checkErrors(field) {
    const form = this.mainInfoGroup.get(field);
    if (form.invalid) {
      this.errors[field].hasError = true;
      if (form.errors.required) {
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.required');
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  getNameLabel() {
    return this.translateService.translate(`message-app.channel.form.name`);
  }

  resetErrors(field) {
    this.errors[field].hasError = false;
  }
}

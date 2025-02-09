import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forEach } from 'lodash-es';
import { forkJoin, ReplaySubject, Subject } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { MediaService, MediaContainerType, MediaUrlPipe } from '@pe/ng-kit/modules/media';

import { DetailService } from '../../../services';
import {
  ActionType,
  ActionUploadType,
  SettingsService
} from '../../../../shared';
import { SnackBarService, SnackBarVerticalPositionType } from '@pe/ng-kit/src/kit/snack-bar';

@Component({
  selector: 'or-action-upload',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss'],
  providers: [MediaUrlPipe],
  host: { class: 'transactions-valigned-modal' }
})
export class ActionUploadComponent implements OnDestroy, OnInit {

  loading: boolean = false;
  submitted: boolean = false;
  filesToUpload: File[] = [];

  modalButtons: any[] = [];

  form: FormGroup = null;

  uploadTypes: {
    value: ActionUploadType,
    label: string
  }[] = [
      {
        value: 'VERDIENSTNACHWEIS',
        label: this.translateService.translate('form.upload.upload_types.merit_prove')
      },
      {
        value: 'SELBSTAENDIGKEIT',
        label: this.translateService.translate('form.upload.upload_types.self_employment_prove')
      },
      {
        value: 'LEGITIMATION',
        label: this.translateService.translate('form.upload.upload_types.identification')
      },
      {
        value: 'SONSTIGES',
        label: this.translateService.translate('form.upload.upload_types.other')
      }
    ];

  close$: Subject<void> = new Subject<void>();

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('fileInput') private fileInput: ElementRef;
  @ViewChild('submitTrigger') private submitTrigger: ElementRef;

  private readonly DEFAULT_MAX_IMAGE_SIZE: number = 5242880; // 5mb
  private readonly FILE_NAME_MAX_LENTH: number = 35;

  constructor(
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private mediaService: MediaService,
    private mediaUrlPipe: MediaUrlPipe,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    private snackBarService: SnackBarService,
  ) { }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.settingsService.businessUuid = this.activatedRoute.snapshot.params['uuid'];
    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];
    this.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.form = this.formBuilder.group({
      file: '',
      documents: this.formBuilder.array([
      ])
    });

    this.initModalButtons();
  }

  addFormRow() {
    this.submitted = false;
    const documents = this.form.get('documents') as FormArray;
    documents.push(
      this.formBuilder.group({
        uploadType: ['', Validators.required]
      })
    );
  }

  onChooseFile(): void {
    this.fileInput.nativeElement.click();
    return;
  }

  onChangeFile(event: Event): void {
    this.addFormRow();
    const fileList: FileList = (event.target as HTMLInputElement).files;
    const files: File[] = Array.from(fileList);
    forEach(files, (item: File) => {

      if (item.name.length > this.FILE_NAME_MAX_LENTH) {
        this.showWarning(this.translateService.translate('form.upload.errors.file_name_too_long', { name: item.name }));
        return;
      }

      if (item.size > this.DEFAULT_MAX_IMAGE_SIZE) {
        this.showWarning(this.translateService.translate('form.upload.errors.file_size_too_big'));
        return;
      }

      this.filesToUpload.push(item);
    });

    this.initModalButtons();

    // reseting input field value fixes issue with reuploading same file
    this.fileInput.nativeElement.value = null;
  }

  getDocTypeErrorMessage(): string {
    if (this.submitted) {
      return this.translateService.translate('form.upload.errors.choose_type');
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.form.valid) {
      return;
    }

    this.loading = true;

    const mediaRequests: any[] = this.filesToUpload.map((file: File) => {
      return this.mediaService.createBlobByBusiness(this.settingsService.businessUuid, 'payment-attachments' as MediaContainerType, file).pipe(
        filter((data: any) => data.body && data.body.blobName))
    });
    forkJoin(mediaRequests).pipe(
      mergeMap((data: any[]) => {
        const blobNames: any[] = data.map((mediaResponse: any) => {
          return {
            url: this.mediaUrlPipe.transform(mediaResponse.body.blobName, 'payment-attachments')
          };
        });
        const payloadFiles: any[] = [];
        this.filesToUpload.map((item: File, i: number) => {
          payloadFiles.push({
            type: this.form.get(`documents.${i}.uploadType`).value,
            name: this.filesToUpload[i].name
          });
        });
        const payload: any = {
          fields: {
            payment_upload: {
              models: payloadFiles
            }
          },
          files: blobNames
        };
        return this.detailService.actionOrderUpload(this.orderId, this.action, payload);
      }))
      .subscribe(
        () => this.close$.next(),
        (res) => {
          console.error(res);
          this.showWarning(res.error ? res.error.message || res.error.error : 'Unknown error')
          this.loading = false;
        }
      )
  }

  removeFile(i: number): void {
    this.filesToUpload.splice(i, 1);
    (this.form.get('documents') as FormArray).controls.splice(i, 1);
    this.initModalButtons();
  }

  private initModalButtons(): void {
    this.modalButtons = [{
      title: this.translateService.translate('form.upload.labels.file'),
      onClick: () => this.onChooseFile(),
      location: 'left'
    },
    {
      title: this.translateService.translate('form.upload.submit'),
      onClick: () => this.submitTrigger.nativeElement.click(),
      disabled: !this.filesToUpload.length
    }];
  }

  private showWarning(notification: string): void {
    this.snackBarService.show(
      notification, {
        position: SnackBarVerticalPositionType.Top,
        iconId: 'icon-alert-24',
        iconSize: 24
      }
    );
  }
}

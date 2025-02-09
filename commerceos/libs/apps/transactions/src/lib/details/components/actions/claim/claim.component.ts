import { Component, ChangeDetectionStrategy, OnInit, Injector, Inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { EnvironmentConfigInterface, PeDestroyService, PE_ENV } from '@pe/common';

import { AbstractAction, ActionTypeEnum } from '../../../../shared';
import { DetailsState } from '../../../store';

import { MAX_FILE_SIZE_MB } from './constants';
import { ClaimService, FileService } from './services';
import { DocumentOptionInterface, AddFileInterface } from './types';



@Component({
  selector: 'pe-claim-action',
  styleUrls: ['./claim.component.scss', '../actions.scss'],
  templateUrl: 'claim.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class ActionClaimComponent extends AbstractAction implements OnInit {
  form: FormGroup;
  errorMessage = '';

  documentTypes: DocumentOptionInterface[] = [];

  translationsScope = 'transactions.form.claim';
  isSubmitted = false;
  enableClaim$ = this.store.select(DetailsState.actions).pipe(
    map(actions => !!actions.find(action => action.action === ActionTypeEnum.Claim)?.enabled)
  )

  disableUpload$: Observable<boolean>;

  constructor(
    public injector: Injector,
    private fileService: FileService,
    private claimService: ClaimService,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface
  ) {
    super(injector);
    this.claimService.loadIcons();

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'success-36',
    ]);
  }

  get documentsControl(): FormArray {
    return this.form.controls.claimDocuments as FormArray;
  }

  ngOnInit(): void {
    this.getData();
    this.prepareTypeOptions();
  }

  sendClaim(): void {
    this.isLoading$.next(true);

    this.detailService.actionOrder(this.orderId, {}, ActionTypeEnum.Claim, null, false).pipe(
      tap(() => {
        this.refreshList();
        this.isLoading$.next(false);
      }),
      catchError((error) => {
        this.isLoading$.next(false);
        this.showError({
          message: this.translateService.translate('transactions.action-errors.claim'),
        });

        return throwError(error);
      })
    ).subscribe();
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    this.errorMessage = '';

    this.sendClaimDocuments(this.orderId, ActionTypeEnum.ClaimUpload, null);
  }

  createForm(): void {
    this.form = new FormGroup({
      claimDocuments: new FormArray([], Validators.required),
    });

    this.disableUpload$ = this.documentsControl.valueChanges.pipe(
      withLatestFrom(this.isLoading$),
      map(([values, loading]) => values.every(doc => doc.isUpload) || loading)
    );
  }

  onFileChange(files: File[]): void {
    this.checkFileAndAddControl(files);
  }

  onDeleteFile(index: number): void {
    this.documentsControl.removeAt(index);
  }

  private checkFileAndAddControl(files: File[]) {
    const allowedFiles = this.fileService.filterByExtensions(files);
    this.errorMessage = '';

    const filesArray = allowedFiles.filter((file) => {
      const tooBig = this.fileService.checkMaxFileSize(file);
      if (tooBig) {
        this.errorMessage = this.translateService.translate(
          `${this.translationsScope}.errors.tooBigFile`, { fileName: file.name, fileSize: MAX_FILE_SIZE_MB }
        );
      }

      return !tooBig;
    });

    this.fileService.prepareFiles(filesArray).pipe(
      tap(({ fileName, fileBase64, size, type }: AddFileInterface) => {
        this.addControl(fileName, fileBase64, size, type);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private prepareTypeOptions(): void {
    this.documentTypes = this.claimService.getTypeOptions(this.translationsScope);
  }

  private sendClaimDocuments(orderId: string, action: ActionTypeEnum, dataKey: string): void {
    this.isLoading$.next(true);

    const data = this.claimService.prepareActionPayload(this.documentsControl);

    const actions$ = data.documents.map((doc, index) =>
      this.detailService.actionOrder(orderId, doc as any, action, dataKey, false).pipe(
        tap(() => {
          this.documentsControl.controls.forEach((control) => {
            const { documentType, fileName } = control.value;
            if (fileName === doc.fileName && documentType === doc.documentType) {
              control.get('isUpload').setValue(true);
            }
          });
        })
      ),
    );

    forkJoin(actions$).pipe(
      tap(() => {
        this.refreshList();
        this.isLoading$.next(false);
        this.cdr.detectChanges();
      }),
      catchError((error) => {
        this.isLoading$.next(false);
        this.showError({
          message: this.translateService.translate('transactions.action-errors.claim_upload'),
        });

        return throwError(error);
      })
    ).subscribe();
  }

  private addControl(fileName: string, fileData: string, size: number, type: string): void {
    this.documentsControl.push(new FormGroup({
      documentType: new FormControl('', Validators.required),
      fileName: new FormControl(fileName, [Validators.required, Validators.maxLength(30)]),
      base64Content: new FormControl(fileData),
      size: new FormControl(size),
      type: new FormControl(type),
      isUpload: new FormControl(false),
      _hasError: new FormControl(false),
    }));

    this.isSubmitted = false;
    this.cdr.detectChanges();
  }
}

import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { FormConfigService, SantanderDeFlowService } from '../../../shared/services';
import { INPUTS } from '../../injection-token.constants';
import { DocumentDataInterface } from '../upload-documents';

import {
  descriptionCardSubtitleTranslations,
  uploadDocsTranslations,
} from './proof.component.constant';

@Component({
  selector: 'santander-de-proof',
  templateUrl: './proof.component.html',
  styleUrls: ['./proof.component.scss'],
})
export class ProofComponent implements OnInit {
  private inputs = inject(INPUTS);
  private flowService = inject(SantanderDeFlowService);
  private destroy$ = inject(PeDestroyService);
  private formConfigService = inject(FormConfigService);
  private customElementService = inject(CustomElementService);
  private matDialog = inject(MatDialog);
  @ViewChild('modalContentTemplate') modalContentTemplate: TemplateRef<any>;
  public isUploading$ = new BehaviorSubject<boolean>(false);
  private uploadDocs$ = new Subject<DocumentDataInterface[]>();
  private dialogRef: MatDialogRef<any, any>;

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['upload-documents-28', 'progress-94'],
      null,
      this.customElementService.shadowRoot
    );

    this.uploadDocs$.pipe(
      filter(v => v && v.length > 0),
      tap(() => {
        this.isUploading$.next(true);
      }),
      switchMap(docs => this.flowService.sendDocuments(
        docs.map(doc => ({
          file: doc.base64,
          filename: doc.filename,
          documentType: 'OTHERS',
        }))
      )),
      tap(() => {
        this.isUploading$.next(false);
        this.inputs.next();
      }),
      catchError(() => {
        this.isUploading$.next(false);

        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public translations = {
    headerCardTitle: $localize`:@@santander-de.inquiry.additionalSteps.proof.headerCard.title:`,
    headerCardSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.proof.headerCard.subtitle:`,
    descriptionCardTitle: $localize`:@@santander-de.inquiry.additionalSteps.proof.descriptionCard.title:`,
    descriptionCardSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.proof.descriptionCard.subtitle:`,
    uploadActionTitle: $localize`:@@santander-de.inquiry.additionalSteps.proof.actions.upload.title:`,
    uploadActionSubtitle: $localize`:@@santander-de.inquiry.additionalSteps.proof.actions.upload.subtitle:`,
    uploadDialog: {
      title: $localize`:@@santander-de.inquiry.additionalSteps.proof.uploadDocuments.title:`,
      subtitle: $localize`:@@santander-de.inquiry.additionalSteps.proof.uploadDocuments.subtitle:`,
    },
    skipText: $localize`:@@santander-de.inquiry.additionalSteps.proof.skip.text:`,
  };

  public AsyncTranslations$ = this.formConfigService.employmentGroup$.pipe(
    map(employmentGroup => ({
      descriptionCardSubtitle: descriptionCardSubtitleTranslations[employmentGroup],
    }))
  );

  public docsText$ = this.formConfigService.employmentGroup$.pipe(
    map(employmentGroup => uploadDocsTranslations[employmentGroup])
  );

  skip() {
    this.inputs.skip();
  }

  onClicked() {
    if (this.isUploading$.value) { return }
    const close = (docs: DocumentDataInterface[]) => {
      this.uploadDocs$.next(docs);
      this.dialogRef.close();
    };
    this.dialogRef = this.matDialog.open(this.modalContentTemplate, {
      data: {
        close,
      },
    });
  }
}

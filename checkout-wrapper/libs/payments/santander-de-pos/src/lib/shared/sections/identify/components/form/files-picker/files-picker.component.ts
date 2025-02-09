import {
  ChangeDetectionStrategy, Component,
  EventEmitter, Inject, Injector, Input, OnInit, Optional, Output, Self,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, ReplaySubject, merge } from 'rxjs';
import { filter, map, skip, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import {
  DocsManagerService,
  DocumentSideEnum,
  FormOptionsInterface,
  PersonTypeEnum,
  PERSON_TYPE,
  DocumentTypes,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, ParamsState } from '@pe/checkout/store';
import { FlowInterface, FormOptionInterface } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { PickedFileInterface } from '../image-capture';

export interface FileInterface {
  name: string;
  blobName: string;
}

export interface DocumentFileInterface {
  type: string;
  content: string;
}
export interface DocumentFilesInterface {
  images: DocumentFileInterface[];
}

export interface DocumentsInterface {
  front?: DocumentFileInterface;
  back?: DocumentFileInterface;
}

@Component({
  selector: 'files-picker',
  templateUrl: 'files-picker.component.html',
  styleUrls: ['./files-picker.component.scss'],
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePickerComponent implements OnInit, ControlValueAccessor {
  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;
  @SelectSnapshot(ParamsState.editMode) protected editMode: boolean;

  @Input() set nodeFormOptions(options: FormOptionsInterface) {
    this.identifications = options.identifications.map(item => ({ ...item })).reverse();
  }

  @Input() accept = '*';
  @Input() identificationType: string;
  @Input() docOtherType: string;
  @Input() analyticId: string;

  @Output() changeIdentificationType = new EventEmitter<string>();
  @Output() changeOtherDocType = new EventEmitter<string>();
  @Output() filesReady = new EventEmitter<boolean>();
  @Output() sendDocsRequired = new EventEmitter<boolean>();

  private onChange: (value: any) => void;
  private onTouch: () => void;

  public readonly DocumentSideEnum: typeof DocumentSideEnum = DocumentSideEnum;
  public readonly imageCaptureTitle = $localize`:@@payment-santander-de-pos.inquiry.filePicker.uploaded:`;
  public readonly buttonFrontCtx = {
    label: $localize`:@@payment-santander-de-pos.inquiry.filePicker.labels.documentFront:`,
    sideType: DocumentSideEnum.Front,
    documentType: 'IDENTIFICATION',
  };

  public readonly buttonBackCtx = {
    label: $localize`:@@payment-santander-de-pos.inquiry.filePicker.labels.documentBack:`,
    sideType: DocumentSideEnum.Back,
    documentType: 'IDENTIFICATION',
  };

  public readonly buttonOtherFrontCtx = {
    ...this.buttonFrontCtx,
    documentType: 'OTHERS',
  };

  public readonly buttonOtherBackCtx = {
    ...this.buttonBackCtx,
    documentType: 'OTHERS',
  };

  public readonly otherTypes: FormOptionInterface[] = [
    {
      label: $localize `:@@payment-santander-de-pos.inquiry.filePicker.residencePermit:`,
      value: 'residencePermit',
    }, {
      label: $localize `:@@payment-santander-de-pos.inquiry.filePicker.registrationCertificate:`,
      value: 'registrationCertificate',
    },
  ];

  public identifications: FormOptionInterface[] = [];
  public selectedIdentification: string = null;
  public selectedOtherType: string = null;
  public errorMessage: string;

  private uploadedDocs = false;
  private readonly toggleDocumentTypeSubject$ = new ReplaySubject();
  private readonly onFileChanged$ = new BehaviorSubject(false);
  public readonly isOtherDocuments$ = this.toggleDocumentTypeSubject$.pipe(
    map(type => type === 'PASSPORT'),
  );

  public readonly toggleOtherTypeSubject$ = new BehaviorSubject(null);
  public readonly isOtherOnlyFrontSize$ = this.toggleOtherTypeSubject$.pipe(
    map(type => type === 'registrationCertificate')
  );

  public readonly isOnlyFrontSize$ = this.isOtherDocuments$;

  constructor(
    protected customElementService: CustomElementService,
    protected injector: Injector,
    private docsManagerService: DocsManagerService,
    private destroy: PeDestroyService,
    @Inject(PERSON_TYPE) private person: PersonTypeEnum,
    @Optional() @Self() private ngControl: NgControl,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'arrow-upload2',
      'retro-camera',
      'b-remove-16',
      'checkmark-32',
    ], null, this.customElementService.shadowRoot);
  }

  ngOnInit(): void {
    this.selectedIdentification = this.identificationType ?? (this.identifications[0]?.value as string);
    this.changeIdentificationType.emit(this.selectedIdentification);

    const toggleOtherTypeSubject$ = this.toggleOtherTypeSubject$.pipe(
      filter(d => !!d),
      skip(1),
      tap((docOtherType) => {
        this.changeOtherDocType.emit(String(docOtherType));
        this.docsManagerService.deleteDocuments(this.flow.id, this.person, 'OTHERS');
      }),
    );

    const onFilePickedBase64$ = merge(
      this.onFileChanged$,
      this.toggleDocumentTypeSubject$,
      this.toggleOtherTypeSubject$
    ).pipe(
      map(value => !!value),
      withLatestFrom(this.isOnlyFrontSize$, this.isOtherOnlyFrontSize$),
      tap(([sendDocsRequired, isOnlyFrontSize, isOtherOnlyFrontSize]) => {
        const allDocs = this.docsManagerService.getDocuments(this.flow.id, this.person);
        const docsCount = (isOnlyFrontSize && isOtherOnlyFrontSize) || !isOnlyFrontSize
          ? 2
          : 3;

        const filesReady = allDocs.length === docsCount;
        this.filesReady.emit(filesReady);
        this.sendDocsRequired.emit(!filesReady || (filesReady && sendDocsRequired));
        this.uploadedDocs = false;
      })
    );

    merge(
      toggleOtherTypeSubject$,
      onFilePickedBase64$,
    ).pipe(
      takeUntil(this.destroy)
    ).subscribe();
  }

  onFileRemove(side: DocumentSideEnum, documentType: DocumentTypes): void {
    this.docsManagerService.deleteDocuments(this.flow.id, this.person, documentType, side);

    this.onFileChanged$.next(true);

    this.filesReady.emit(false);
  }

  onFilePickedBase64(side: DocumentSideEnum, data: PickedFileInterface, documentType: DocumentTypes): void {
    const extension: string = this.getFileExtensionFromBase64(data.base64);
    this.docsManagerService.addDocument({
      type: extension,
      filename: data.fileName || `${this.person}-${this.identificationType}-${side}.${extension}`, // file.name,
      base64: data.base64,
      documentType,
    }, this.flow.id, this.person, side);
    this.onFileChanged$.next(true);
  }

  onErrorTriggered(error: string): void {
    this.errorMessage = error;
  }

  isPickedFile(side: DocumentSideEnum, documentType: DocumentTypes): boolean {
    const docs = this.docsManagerService.getDocuments(
      this.flow.id,
      this.person,
      documentType,
      side
    );

    return docs?.length > 0 || this.uploadedDocs;
  }

  toggleDocumentType(identificationType: string): void {
    this.toggleDocumentTypeSubject$.next(identificationType);
    if (!identificationType || identificationType === this.selectedIdentification) {
      return;
    }

    this.selectedIdentification = identificationType;
    this.docsManagerService.deleteDocuments(this.flow.id, this.person);

    this.changeIdentificationType.emit(this.selectedIdentification);
    this.filesReady.emit(false);
  }

  writeValue(value: boolean): void {
    this.uploadedDocs = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  private getFileExtensionFromBase64(base64: string): string {
    return base64.split(';')[0].split('/')[1];
  }
}

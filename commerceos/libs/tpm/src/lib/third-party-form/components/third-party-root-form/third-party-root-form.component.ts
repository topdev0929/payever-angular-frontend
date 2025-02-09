import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  TemplateRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { forEach, assign, keys, reduce } from 'lodash-es';
import { BehaviorSubject, ReplaySubject, of, Observable, Subject } from 'rxjs';
import { catchError, map, timeout, finalize, takeUntil, tap } from 'rxjs/operators';


// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PeAuthService } from '@pe/auth';
import { FormSchemeField as BaseFormSchemeField } from '@pe/forms';
import { FieldSettingsInterface } from '@pe/forms-core';
import { TranslationLoaderService, TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import {
  InfoBoxOperationInterface,
  InfoBoxSettingsInterface,
  InfoBoxSettingsInfoBoxTypeInterface,
  InfoBoxSettingsConfirmTypeInterface,
  InfoBoxSettingsContentInterface,
  PeListCellType,
  PeListCellToggleInterface,
  OperationInterface,
  AccordionPanelInterface,
  ThirdPartyFormServiceInterface,
  InfoBoxSettingsInFormInterface,
  HandlePayeverFieldsSaveCallback, ThirdPartyBaseApiData, InfoBoxSettingsConfirmContent,
} from '../../interfaces';
import {
  DynamicInfoBoxGeneratorFormData,
  ThirdPartyFormComponent,
} from '../third-party-form/third-party-form.component';

export interface ConnectSchemeField extends FieldSettingsInterface {
  fieldSettings?: {
    dynamic?: boolean;
    dependControl?: string;
    dependValue?: string;
  }
}

interface FormSchemeField extends BaseFormSchemeField {
  asyncSave?: boolean;
}

const GET_TRANSLATIONS_TIMEOUT = 3000;

@Component({
  selector: 'pe-third-party-root-form',
  templateUrl: './third-party-root-form.component.html',
  styleUrls: ['./third-party-root-form.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class ThirdPartyRootFormComponent implements OnInit, OnDestroy {
  @ViewChild('printModalTpl') printModalTpl: TemplateRef<any>;
  private printDialogRef: MatDialogRef<any>;

  formLoading: boolean;
  settings: InfoBoxSettingsInterface;
  settingsNonFormSaved: InfoBoxSettingsInterface;
  leftOperations: InfoBoxOperationInterface[];
  rightOperations: InfoBoxOperationInterface[];
  submittedForm: FormGroup;
  printImageUrl: string;

  // This flag is used to force recreated <pe-third-party-form>
  // If we don't recreate - it keeps old form inputs and updated fields are not visible
  showForm: boolean;

  fieldset: FormSchemeField[];
  fieldsetData: DynamicInfoBoxGeneratorFormData;
  payeverFieldsData: {} = {};
  listCellTypes: typeof PeListCellType = PeListCellType;

  $translationsReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly isShowDebugButtonText: boolean = false;

  currentOperation: OperationInterface = null;
  isSubmitted = false;

  private confirmResponseSubject = new Subject<OperationInterface>();

  @Input() baseApiData: ThirdPartyBaseApiData = {};

  @Input()
  set confirmResponse(value: OperationInterface) {
    this.confirmResponseSubject.next(value);
  }

  @Input() withHeader = true;
  @Input() expandedIndex: number = null;
  @Input() handlePayeverFieldsSaveCallback: HandlePayeverFieldsSaveCallback = null;
  @Input() thirdPartyFormService: ThirdPartyFormServiceInterface;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('payeverFieldsData') set setPayeverFieldsData(payeverFieldsData: {}) {
    forEach(payeverFieldsData, (value: any, key: string) => {
      if (key.indexOf('pe_') !== 0) {
        console.error('Keys in payeverFieldsData must start with "pe_"');
        delete payeverFieldsData[key];
      }
    });
    this.payeverFieldsData = payeverFieldsData;
  }

  @Input() translationsCategory: string = null;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onConfirm = new EventEmitter<InfoBoxSettingsConfirmContent>();

  @ViewChildren(ThirdPartyFormComponent) infoBoxGeneratorForms: QueryList<ThirdPartyFormComponent>;
  @ViewChild('infoBoxGeneratorForm') infoBoxGeneratorForm: ThirdPartyFormComponent;
  // TODO: check if this.form is necessary
  get form(): FormGroup {
    return this.infoBoxGeneratorForm ? this.infoBoxGeneratorForm.form : null;
  }

  private inlineImages: { [key: string]: BehaviorSubject<string> } = {};
  private safeUrls: { [key: string]: SafeUrl } = {};

  private lastRequest: Observable<null> = null;

  private get firstSubmitOperation(): InfoBoxOperationInterface {
    let resultAction: InfoBoxOperationInterface;
    if (this.leftOperations) {
      resultAction = this.leftOperations
        .concat(this.rightOperations)
        .find((operation: InfoBoxOperationInterface) => operation.isSubmit);
    }

    return resultAction;
  }

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private httpClient: HttpClient,
    private snackBarService: SnackbarService,
    private translationLoaderService: TranslationLoaderService,
    private translateService: TranslateService,
    private peAuthService: PeAuthService,
    private dialog: MatDialog,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(['warning-20']);
  }

  ngOnDestroy(): void {
    window.onafterprint = undefined;
    window.onfocus = undefined;
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get infoBoxSettings(): InfoBoxSettingsInfoBoxTypeInterface {
    return this.settings as InfoBoxSettingsInfoBoxTypeInterface;
  }

  get confirmSettings(): InfoBoxSettingsConfirmTypeInterface {
    return this.settings as InfoBoxSettingsConfirmTypeInterface;
  }

  ngOnInit(): void {
    this.startThirdParty();
    const detachDialog = () => {
      this.printDialogRef?.close();
      this.printImageUrl = null;
      this.cdr.detectChanges();
    };
    window.onafterprint = detachDialog;
    window.onfocus = detachDialog;
    if (window && window.opener && (window.opener as any).peClosePopUpOfTPM) {
      // To close popup faster you can just redirect to the static page:
      //  https://payevertest.azureedge.net/html/close-popup-tpm.html
      (window.opener as any).peClosePopUpOfTPM();
    }

    if (this.translationsCategory) {
      const i18nDomains = [`tpm-${this.translationsCategory}`, `tpm-forms`];
      this.translationLoaderService
        .loadTranslations(i18nDomains)
        .pipe(
          timeout(GET_TRANSLATIONS_TIMEOUT),
          catchError((err) => {
            console.warn('Cant load TPM traslations for domains', i18nDomains, err);

            return of(true);
          }),
        )
        .subscribe(() => {
          this.$translationsReady.next(true);
        });
    } else {
      this.$translationsReady.next(true);
    }

    this.confirmResponseSubject.pipe(
      takeUntil(this.destroyed$),
      tap((response) => {
        this.performOperation(response, this.fieldset);
      }),
    ).subscribe();
  }

  startThirdParty(): void {
    const request = this.thirdPartyFormService.requestInitialForm().pipe(
      map((response) => {
        if (response?.form) {
          this.setInfoBoxSettings(response.form);
        }

        return response;
      }),
      catchError((error) => {
        this.showError(error);
        this.currentOperation = null;

        return of(null);
      }),
      finalize(() => {
        this.formLoading = false;
        this.cdr.detectChanges();
      }),
    );
    this.lastRequest = request;
    request.subscribe();
  }

  btnDebug(text: string): string {
    return this.isShowDebugButtonText ? `<strong>&lt;${text}&gt;</strong>` : '';
  }

  updateOperations(operations: InfoBoxOperationInterface[]): void {
    this.leftOperations = operations.filter(operation => operation.align === 'left');
    this.rightOperations = operations.filter(operation => operation.align === 'right');
  }

  getSearchOperation(): InfoBoxOperationInterface {
    const searchOperation: InfoBoxOperationInterface = this.rightOperations && this.rightOperations[1];

    return searchOperation && searchOperation.text === 'Search' ? searchOperation : null; // TODO need to change 'Search'
  }

  onFormChange(event: any, fieldset: FormSchemeField[], operation?: InfoBoxOperationInterface): void {
    if (this.hasAsyncField(fieldset)) {
      if (operation) {
        this.submittedForm = this.getSubmittedForm(operation.action);
        this.performOperation(operation, fieldset, true);
      } else {
        const searchOperation: InfoBoxOperationInterface = this.getSearchOperation();
        if (searchOperation) {
          // TODO: check if this crunch is necessary
          const data: any = this.form && this.form.value;
          if (data && data.number && data.number.length !== 2 && data.number.length !== 1) {
            this.performOperation(searchOperation, fieldset, true);
          }
        } else {
          const firstSubmitAction: InfoBoxOperationInterface = this.firstSubmitOperation;
          if (firstSubmitAction) {
            this.performOperation(firstSubmitAction, fieldset, true);
          }
        }
      }
      this.performPayeverOperation(fieldset, true);
    }
  }

  onFormSubmit(event: any, fieldset: FormSchemeField[], operation?: InfoBoxOperationInterface): void {
    this.isSubmitted = true;
    if (operation) {
      this.submittedForm = this.getSubmittedForm(operation.action);
      this.performOperation(operation, fieldset);
    } else {
      const searchOperation: InfoBoxOperationInterface = this.getSearchOperation();
      if (searchOperation) {
        // TODO: check if this crunch is necessary
        const data: any = this.form && this.form.value;
        if (data && data.number && data.number.length !== 2 && data.number.length !== 1) {
          this.performOperation(searchOperation, fieldset);
        }
      } else {
        const firstSubmitOperation: InfoBoxOperationInterface = this.firstSubmitOperation;
        if (firstSubmitOperation) {
          this.performOperation(firstSubmitOperation, fieldset);
        }
      }
    }
    this.performPayeverOperation(fieldset);
  }

  operationLink(operation: OperationInterface): string {
    return operation.forceUrl
      ? this.thirdPartyFormService?.prepareUrl(operation.forceUrl)
      : this.thirdPartyFormService?.getActionUrl(operation.action);
  }

  isOperationLoading(operation: OperationInterface): boolean {
    return this.currentOperation === operation;
  }

  panelSubmitOperation(
    panel: ThirdPartyFormComponent,
    operation: OperationInterface,
    fieldset: FormSchemeField[] = null,
  ): void {
    this.submittedForm = panel.form;
    this.performOperation(operation, fieldset);
  }

  performOperation(
    operation: OperationInterface,
    fieldset: FormSchemeField[] = null,
    onlyForAsyncFields: boolean = false,
    onFail: () => void = null,
  ): void {
    this.currentOperation = operation;
    if (operation && operation.open === 'self') {
      window.top.location.href = this.operationLink(operation);
    } else if (operation && operation.open === 'blank') {
      const opened = window.open(this.operationLink(operation), 'window');
      if (opened) { opened.focus(); }
      this.currentOperation = null;
    } else if (operation && operation.open === 'popup') {
      const winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const width = operation.width || winWidth / 2;
      const height = operation.height || winHeight / 2;
      operation.forceUrl = operation.forceUrl.replace(
        /\{redirectUrl\}/,
        `${this.baseApiData.redirectUri}`);
      let opened = window.open(
        this.operationLink(operation),
        '_blank',
        `width=${width},height=${height},left=${(winWidth - width) / 2},top=${(winHeight - height) / 2}`
      );
      if (opened) { opened.focus(); }
      // Backend should radirect to https://payevertesting.azureedge.net/html/close-popup-tpm.html
      //  when facebook is connected to make iframe popup closing work
      this.$translationsReady.next(false);
      (window as any).peClosePopUpOfTPM = () => {
        if (opened) {
          opened.close();
          opened = null;
          // To reload page data
          if (operation.refreshOperation) {
            this.performOperation(operation.refreshOperation, fieldset);
          } else {
            this.lastRequest.subscribe();
          }
        }
      };
      (window as any).peClosePopUpOfTPMError = (error) => {
        if (opened) {
          opened.close();
          opened = null;

          this.snackBarService.toggle(true, {
            content: error,
            duration: 5000,
            iconColor: '#E2BB0B',
            iconId: 'icon-alert-24',
            iconSize: 24,
          });
        }
      };
      this.currentOperation = null;
      this.formLoading = false;
    }
    else {
      this.formLoading = true;
      // this.showSpinnerForAction = operation.action;

      if (this.submittedForm) {
        if (operation.isSubmit && this.submittedForm.invalid) {
          return;
        }
      } else {
        if (operation.isSubmit && this.form && this.form.invalid) {
          return;
        }
      }
      this.sendRequest(operation, fieldset, onlyForAsyncFields, onFail);
    }
  }

  isAsyncField(key: string, fieldset: FormSchemeField[]): boolean {
    const field: FormSchemeField = fieldset ? fieldset.find(f => f.name === key) : null;

    return field && field.asyncSave;
  }

  isDynamicField(key: string, fieldset: FormSchemeField[]): boolean {
    const field: FormSchemeField = fieldset ? fieldset.find(f => f.name === key) : null;

    return field && (field as ConnectSchemeField).fieldSettings?.dynamic;
  }

  hasAsyncField(fieldset: FormSchemeField[]): boolean {
    return !!fieldset.find(f => f.asyncSave);
  }

  performPayeverOperation(fieldset: FormSchemeField[], onlyForAsyncFields: boolean = false): void {
    // This is for payever fields, that have 'pe_' prefix.
    let data: {} = this.submittedForm ? this.submittedForm.value : this.form ? this.form.value : {};

    data = reduce(
      data,
      (result: {}, value: any, key: string) => {
        if (onlyForAsyncFields && this.isAsyncField(key, fieldset)) {
          result[key] = value;
        } else if (!onlyForAsyncFields && !this.isAsyncField(key, fieldset)) {
          result[key] = value;
        }

        return result;
      },
      {},
    );

    data = reduce(
      data,
      (result: {}, value: any, key: string) => {
        // Keep only values prefixed with 'pe_'
        if (key.indexOf('pe_') === 0) {
          result[key] = value;
        }

        return result;
      },
      {},
    );

    if (keys(data).length > 0) {
      if (this.handlePayeverFieldsSaveCallback) {
        this.handlePayeverFieldsSaveCallback(data).subscribe(() => {
          this.cdr.detectChanges();
        });
      }
    }
  }

  onFailToggle(element: MatSlideToggle): void {
    element.toggle(); // Revert toggle position
  }

  performToggleOperation(element: MatSlideToggle, cell: PeListCellToggleInterface, fieldset: FormSchemeField[]): void {
    if (!cell.checked) {
      this.performOperation(
        { request: cell.requestOn, action: cell.actionOn, actionData: {} },
        fieldset,
        false,
        () => {
          this.onFailToggle(element); // Revert toggle position
        }
      );
    } else {
      this.performOperation(
        { request: cell.requestOff, action: cell.actionOff, actionData: {} },
        fieldset,
        false,
        () => {
          this.onFailToggle(element); // Revert toggle position
        },
      );
    }
  }

  performToggleButtonOperation(element: MatSlideToggle, cell: OperationInterface, fieldset: FormSchemeField[]): void {
    this.performOperation(
      cell,
      fieldset,
      false,
      () => {
        this.onFailToggle(element); // Revert toggle position
      }
    );
  }

  sendRequest(
    operation: OperationInterface,
    fieldset: FormSchemeField[],
    onlyForAsyncFields: boolean = false,
    onFail: () => void = null,
  ): void {
    const submitAllForm = operation.isSubmitAll ?
      Object.assign(
        {},
        ...this.infoBoxGeneratorForms.toArray().map(infoBox => infoBox.form.value)
      ) : null;

    const formValue: {} = operation.isSubmitAll
      ? submitAllForm
      : this.submittedForm
        ? this.submittedForm.value
        : this.form
          ? this.form.value : {};

    const formKeys = Object.keys(formValue);
    const tempFormValue = {};

    let data: {} = Object.assign({}, this.activatedRoute.snapshot.queryParams, formValue);

    data = reduce(
      data,
      (result: {}, value: any, key: string) => {
        if (key.indexOf('pe_') >= 0) {
          return result;
        }

        if (onlyForAsyncFields && this.isAsyncField(key, fieldset)) {
          result[key] = value;
        } else if (!onlyForAsyncFields && !this.isAsyncField(key, fieldset)) {
          result[key] = value;
        }

        if (formKeys.includes(key) && this.isDynamicField(key, fieldset)) {
          tempFormValue[key] = result[key];
          delete result[key];
        }

        return result;
      },
      {},
    );

    const reqData: {} = {
      ...this.baseApiData,
      ...{
        ...data,
        ...this.thirdPartyFormService.wrapFormData(tempFormValue),
      },
      ...this.infoBoxSettings.actionContext,
      ...operation.actionData,
      action: operation.action,
    };

    let request = null;
    if (this.thirdPartyFormService.allowCustomActions() && operation.request && operation.request.url) {
      request = this.httpClient.request<InfoBoxSettingsInFormInterface>(
        operation.request.method || 'POST',
        operation.request.url,
        {
          body: reqData,
          headers: {
            authorization: `Bearer ${this.peAuthService.token}`,
          },
        },
      );
    } else {
      request = this.thirdPartyFormService.executeAction(operation.action, reqData);
    }

    request = request.pipe(
      map((response: any) => {
        if (response?.form) {
          this.setInfoBoxSettings(response.form);
        }

        return response;
      }),
      catchError((error) => {
        this.showError(error);
        this.currentOperation = null;
        this.isSubmitted = true;

        if (onFail) {
          onFail();
        }

        return of(null);
      }),
      finalize(() =>  {
        this.isSubmitted = true;
        this.formLoading = false;
        this.cdr.detectChanges();
      }),
    );
    this.lastRequest = request;
    request.subscribe();
  }

  setInfoBoxSettings(response: InfoBoxSettingsInterface): void {
    // Download
    const triggerDownloadUrl = response ? (response as InfoBoxSettingsInfoBoxTypeInterface).triggerDownloadUrl : null;
    if (triggerDownloadUrl) {
      this.httpClient
        .get<Blob>(triggerDownloadUrl, {
          responseType: 'blob' as any,
          headers: {
            authorization: `Bearer ${this.peAuthService.token}`,
          },
        })
        .subscribe(
          (blob: Blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              const a = document.createElement('a');
              a.target = '_blank';
              a.href = String(reader.result);
              a.download = (response as InfoBoxSettingsInfoBoxTypeInterface).triggerDownloadFileName ??
                String(triggerDownloadUrl.split('/').pop());
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            };
            reader.readAsDataURL(blob);
          },
          () => {
            // TODO
          },
        );
    }
    // Print
    const triggerPrintUrl = response ? (response as InfoBoxSettingsInfoBoxTypeInterface).triggerPrintUrl : null;
    if (triggerPrintUrl) {
      this.httpClient
        .get<Blob>(triggerPrintUrl, {
          responseType: 'blob' as any,
          headers: {
            authorization: `Bearer ${this.peAuthService.token}`,
          },
        })
        .subscribe(
          (blob: Blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.printImageUrl = String(reader.result);
              this.cdr.detectChanges();
              this.printDialogRef = this.dialog.open(this.printModalTpl, {
                panelClass: 'tpm-print-dialog',
                position: {
                  top: '0',
                },
              });
              this.printDialogRef.afterOpened().subscribe(() => {
                setTimeout(() => window.print(), 0);
              });
            };
            reader.readAsDataURL(blob);
          },
          () => {
            // TODO
          },
        );
    }
    // Rest part
    if (!this.showForm) {
      this.settingsNonFormSaved = this.settings;
    }
    this.showForm = false;
    this.formLoading = false;
    this.currentOperation = null;
    this.cdr.detectChanges();

    if (response && response.type === 'info-box') {
      this.settings = response;
      if (response.operations) {
        this.updateOperations(response.operations);
      }

      this.setupForm(response && response.content || {});
    } else if (response && response.type === 'confirm') {
      this.onConfirm.emit(response.confirmContent);
    } else if (response && response.type === 'redirect') {
      window.top.location.href = response.url;
    }
    this.submittedForm = null;
    this.cdr.detectChanges();
  }

  handleClose(): void {
    if (this.showForm) {
      this.settings = this.settingsNonFormSaved;
      this.showForm = false;
      this.cdr.detectChanges(); // fix 'disabled:null -> disabled:true'
    } else {
      this.onClose.emit();
    }
  }

  getExpandedIndex(): number {
    let result: number = this.expandedIndex || 0;
    if (!this.expandedIndex && this.infoBoxSettings && this.infoBoxSettings.content) {
      const accordion: AccordionPanelInterface[] = this.infoBoxSettings.content.accordion || [];
      for (let i = 0; i < accordion.length; i++) {
        if (!accordion[i].disabled && !accordion[i].hideToggle) {
          result = i;
          break;
        }
      }
    }

    return result;
  }

  prepareFieldsetData(fieldsetData: {}): {} {
    return assign(fieldsetData || {}, this.payeverFieldsData || {});
  }

  imgAsInline(url: string): Observable<string> {
    if (!this.inlineImages[url]) {
      this.inlineImages[url] = new BehaviorSubject<string>(null);
      this.httpClient
        .get<Blob>(url, {
          responseType: 'blob' as any,
          headers: {
            authorization: `Bearer ${this.peAuthService.token}`,
          },
        })
        .subscribe(
          (blob: Blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.inlineImages[url].next(String(reader.result));
            };
            reader.readAsDataURL(blob);
          },
          () => {
            // TODO
          },
        );
    }

    return this.inlineImages[url].asObservable();
  }

  translate(key: string): string {
    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : key;
  }

  safeUrl(value: string): SafeUrl {
    if (!this.safeUrls[value]) {
      const sanitizedValue = this.sanitizer.bypassSecurityTrustResourceUrl(value);
      const url = new URL(sanitizedValue.toString());

      if (url.origin !== window.location.origin) {
        throw new Error('Origin mismatch between iframe and parent');
      }


      this.safeUrls[value] = this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }

    return this.safeUrls[value];
  }

  private getSubmittedForm(actionId: string): FormGroup {
    let currentFormValue;

    if (!this.infoBoxGeneratorForms || !actionId) {
      return null;
    }

    this.infoBoxGeneratorForms.toArray().forEach((f) => {
      if (f.operation && actionId === f.operation.action) {
        currentFormValue = f.form;
      }
    });

    return currentFormValue || null;
  }

  private setupForm({ fieldset, fieldsetData }: InfoBoxSettingsContentInterface): void {
    if (fieldset) {
      this.fieldset = fieldset;
      this.fieldsetData = this.prepareFieldsetData(fieldsetData);
      this.showForm = true;
      this.cdr.detectChanges(); // fix 'disabled:null -> disabled:true'
    } else {
      this.showForm = false;
      this.cdr.detectChanges();
      this.$translationsReady.next(true);
    }
  }

  private showError(error: any): void {
    if (!error) {
      return;
    }

    const errorSource = error?.rawError ? error.rawError : error.error;
        const message = errorSource.error
      ? this.translate(errorSource.error)
      : typeof errorSource?.message === 'string'
        ? this.translate(errorSource.message)
        : this.translateService.translate('errors.unknown_error');

    this.snackBarService.toggle(true, {
      content: message,
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}

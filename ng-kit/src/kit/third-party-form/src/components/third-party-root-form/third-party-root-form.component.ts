import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList,
  ViewChild, ViewChildren, ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { catchError, map, takeUntil, timeout } from 'rxjs/operators';
import { forEach, assign, keys, reduce } from 'lodash-es';

import { MatSlideToggle } from '@angular/material/slide-toggle';

import { FormSchemeField as BaseFormSchemeField } from '../../../../form';
import { SnackBarService } from '../../../../snack-bar';
import { TranslateService, TranslationLoaderService } from '../../../../i18n';
import { AbstractComponent } from '../../../../common';

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
  HandlePayeverFieldsSaveCallback
} from '../../interfaces';
import { DynamicInfoBoxGeneratorFormData, ThirdPartyFormComponent } from '../third-party-form/third-party-form.component';

interface FormSchemeField extends BaseFormSchemeField {
  asyncSave?: boolean;
}

const GET_TRANSLATIONS_TIMEOUT = 3000;

@Component({
  selector: 'pe-third-party-root-form',
  templateUrl: './third-party-root-form.component.html',
  styleUrls: ['./third-party-root-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThirdPartyRootFormComponent extends AbstractComponent implements OnInit {
  formLoading: boolean;
  settings: InfoBoxSettingsInterface;
  settingsNonFormSaved: InfoBoxSettingsInterface;
  leftOperations: InfoBoxOperationInterface[];
  rightOperations: InfoBoxOperationInterface[];
  submittedForm: FormGroup;
  printImageUrl: string;

  showForm: boolean;
  fieldset: FormSchemeField[];
  fieldsetData: DynamicInfoBoxGeneratorFormData;
  payeverFieldsData: {} = {};
  listCelTypes: typeof PeListCellType = PeListCellType;

  $translationsReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly isShowDebugButtonText: boolean = false;

  currentOperation: OperationInterface = null;

  @Input() baseApiData: any = {};
  @Input() withHeader: boolean = true;
  @Input() expandedIndex: number = null;
  @Input() handlePayeverFieldsSaveCallback: HandlePayeverFieldsSaveCallback = null;
  @Input() thirdPartyFormService: ThirdPartyFormServiceInterface;
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

  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  @ViewChildren(ThirdPartyFormComponent) infoBoxGeneratorForms: QueryList<ThirdPartyFormComponent>;
  @ViewChild('infoBoxGeneratorForm') infoBoxGeneratorForm: ThirdPartyFormComponent;
  // TODO: check if this.form is necessary
  get form(): FormGroup {
    return this.infoBoxGeneratorForm ? this.infoBoxGeneratorForm.form : null;
  }

  private inlineImages: {[key: string]: BehaviorSubject<string> } = {};
  private safeUrls: {[key: string]: SafeUrl} = {};
  private lastRequest: Observable<null> = null;

  private get firstSubmitOperation(): InfoBoxOperationInterface {
    let resultAction: InfoBoxOperationInterface;
    if (this.leftOperations) {
      resultAction = this.leftOperations.concat(this.rightOperations).find((operation: InfoBoxOperationInterface) => operation.isSubmit);
    }
    return resultAction;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private httpClient: HttpClient,
    private snackBarService: SnackBarService,
    private translationLoaderService: TranslationLoaderService,
    private translateService: TranslateService
  ) {
    super();
  }

  get infoBoxSettings(): InfoBoxSettingsInfoBoxTypeInterface {
    return this.settings as InfoBoxSettingsInfoBoxTypeInterface;
  }

  get confirmSettings(): InfoBoxSettingsConfirmTypeInterface {
    return this.settings as InfoBoxSettingsConfirmTypeInterface;
  }

  ngOnInit(): void {
    this.startThirdParty();
    window.onafterprint = () => {
      of(null).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.printImageUrl = null;
        this.cdr.detectChanges();
      });
    };
    if (window && window.opener && (window.opener as any).peClosePopUpOfTPM) {
      // To close popup faster you can just redirect to the static page:
      //  https://payevertest.azureedge.net/html/close-popup-tpm.html
      (window.opener as any).peClosePopUpOfTPM();
    }

    if (this.translationsCategory) {
      const i18nDomains = [`tpm-${this.translationsCategory}`, `tpm-forms`];
      this.translationLoaderService.loadTranslations(i18nDomains).pipe(
        timeout(GET_TRANSLATIONS_TIMEOUT),
        catchError(err => {
          console.warn('Cant load TPM traslations for domains', i18nDomains, err);
          return of(true);
        }),
      ).subscribe(() => {
        this.$translationsReady.next(true);
      });
    } else {
      this.$translationsReady.next(true);
    }
  }

  startThirdParty(): void {
    const request = this.thirdPartyFormService.requestInitialForm().pipe(
      map(response => {
        this.setInfoBoxSettings(response.form);
        return response;
      }), catchError(error => {
        this.showError(error.message);
        this.currentOperation = null;
        this.formLoading = false;
        this.cdr.detectChanges();
        return of(null);
      })
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
    this.submittedForm = this.getSubmittedForm(operation.action);
    if (operation) {
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
    return operation.forceUrl ? this.thirdPartyFormService.prepareUrl(operation.forceUrl) : this.thirdPartyFormService.getActionUrl(operation.action);
  }

  isOperationLoading(operation: OperationInterface): boolean {
    return this.currentOperation === operation;
  }

  performOperation(operation: OperationInterface, fieldset: FormSchemeField[] = null, onlyForAsyncFields: boolean = false, onFail: () => void = null): void {

    this.currentOperation = operation;
    if (operation && operation.open === 'self') {
      window.top.location.href = this.operationLink(operation);
    }
    else if (operation && operation.open === 'blank') {
      const opened = window.open(this.operationLink(operation), 'window');
      if (opened) opened.focus();
    }
    else if (operation && operation.open === 'popup') {
      const winWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const width = operation.width || (winWidth / 2);
      const height = operation.height || (winHeight / 2);

      let opened = window.open(
        this.operationLink(operation),
        '_blank',
        `width=${width},height=${height},left=${(winWidth - width) / 2},top=${(winHeight - height) / 2}`
      );
      if (opened) opened.focus();
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
      this.currentOperation = null;
      this.formLoading = false;
    }
    else {
      this.formLoading = true;
      // this.showSpinnerForAction = operation.action;

      if ( this.submittedForm ) {
        if ( operation.isSubmit && this.submittedForm.invalid ) {
          return;
        }
      }
      else {
        if ( operation.isSubmit && this.form && this.form.invalid ) {
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

  hasAsyncField(fieldset: FormSchemeField[]): boolean {
    return !!fieldset.find(f => f.asyncSave);
  }

  performPayeverOperation(fieldset: FormSchemeField[], onlyForAsyncFields: boolean = false): void {
    // This is for payever fields, that have 'pe_' prefix.
    let data: {} = this.submittedForm ? this.submittedForm.value : this.form ? this.form.value : {};

    data = reduce(data, (result: {}, value: any, key: string) => {
      if (onlyForAsyncFields && this.isAsyncField(key, fieldset)) {
        result[key] = value;
      } else if (!onlyForAsyncFields && !this.isAsyncField(key, fieldset)) {
        result[key] = value;
      }
      return result;
    }, {});

    data = reduce(data, (result: {}, value: any, key: string) => {
      // Keep only values prefixed with 'pe_'
      if (key.indexOf('pe_') === 0) {
        result[key] = value;
      }
      return result;
    }, {});

    if (keys(data).length > 0) {
      if (this.handlePayeverFieldsSaveCallback) {
        this.handlePayeverFieldsSaveCallback(data).subscribe(() => {
          this.cdr.detectChanges();
        });
      }
    }
  }

  performToggleOperation(element: MatSlideToggle, cell: PeListCellToggleInterface, fieldset: FormSchemeField[]): void {
    const onFail = () => {
      element.toggle(); // Revert toggle position
    };
    if (!cell.checked) {
      this.performOperation({ request: cell.requestOn, action: cell.actionOn, actionData: {} }, fieldset, false, onFail);
    } else {
      this.performOperation({ request: cell.requestOff, action: cell.actionOff, actionData: {} }, fieldset, false, onFail);
    }
  }

  sendRequest(operation: OperationInterface, fieldset: FormSchemeField[], onlyForAsyncFields: boolean = false, onFail: () => void = null): void {
    const formValue: {} = this.submittedForm ? this.submittedForm.value : this.form ? this.form.value : {};
    let data: {} = Object.assign({}, this.activatedRoute.snapshot.queryParams, formValue);

    data = reduce(data, (result: {}, value: any, key: string) => {
      if (onlyForAsyncFields && this.isAsyncField(key, fieldset)) {
        result[key] = value;
      } else if (!onlyForAsyncFields && !this.isAsyncField(key, fieldset)) {
        result[key] = value;
      }
      return result;
    }, {});

    // Remove values prefixed with 'pe_'
    data = reduce(data, (result: {}, value: any, key: string) => {
      if (key.indexOf('pe_') < 0) {
        result[key] = value;
      }
      return result;
    }, {});

    const reqData: {} = {
      ...this.baseApiData,
      ...data,
      ...this.infoBoxSettings.actionContext,
      ...operation.actionData,
      action: operation.action
    };

    let request = null;
    if (this.thirdPartyFormService.allowCustomActions() && operation.request && operation.request.url) {
      request = this.httpClient.request<InfoBoxSettingsInFormInterface>(operation.request.method || 'POST', operation.request.url, { body: reqData });
    } else {
      request = this.thirdPartyFormService.executeAction(operation.action, reqData);
    }
    request = request.pipe(
      map((response: any) => {
        this.setInfoBoxSettings(response.form);
        return response;
      }), catchError(error => {
        this.showError(error.message);
        this.currentOperation = null;
        this.formLoading = false;
        if (onFail) {
          onFail();
        }
        this.cdr.detectChanges();
        return of(null);
      })
    );
    this.lastRequest = request;
    request.subscribe();
  }

  setInfoBoxSettings(response: InfoBoxSettingsInterface): void {
    // Download
    const triggerDownloadUrl = response ? (response as InfoBoxSettingsInfoBoxTypeInterface).triggerDownloadUrl : null;
    if (triggerDownloadUrl) {
      this.httpClient.get<Blob>(triggerDownloadUrl, { responseType: 'blob' as any }).subscribe((blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const a = document.createElement('a');
          a.target = '_blank';
          a.href = String(reader.result);
          a.download = String(triggerDownloadUrl.split('/').pop());
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
        reader.readAsDataURL(blob);
      }, () => {
        // TODO
      });
    }
    // Print
    const triggerPrintUrl = response ? (response as InfoBoxSettingsInfoBoxTypeInterface).triggerPrintUrl : null;
    if (triggerPrintUrl) {
      this.httpClient.get<Blob>(triggerPrintUrl, { responseType: 'blob' as any }).subscribe((blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.printImageUrl = String(reader.result);
          this.cdr.detectChanges();
          setTimeout(() => window.print(), 0);
        };
        reader.readAsDataURL(blob);
      }, () => {
        // TODO
      });
    }
    // Rest part
    if (!this.showForm) {
      this.settingsNonFormSaved = this.settings;
    }
    this.showForm = false;
    this.formLoading = false;
    this.currentOperation = null;

    if (response && response.type === 'info-box') {
      this.settings = response;
      if (response.operations) {
        this.updateOperations(response.operations);
      }

      this.setupForm(response && response.content || {});
    } else if (response && response.type === 'confirm') {
      this.settings = response;
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
      this.httpClient.get<Blob>(url, { responseType: 'blob' as any }).subscribe((blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.inlineImages[url].next(String(reader.result));
        };
        reader.readAsDataURL(blob);
      }, () => {
        // TODO
      });
    }
    return this.inlineImages[url].asObservable();
  }

  translate(key: string): string {
    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : key;
  }

  safeUrl(value: string): SafeUrl {
    if (!this.safeUrls[value]) {
      this.safeUrls[value] = this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
    return this.safeUrls[value];
  }

  private getSubmittedForm(actionId: string): FormGroup {
    let currentFormValue;

    if (!this.infoBoxGeneratorForms || !actionId) {
      return null;
    }

    this.infoBoxGeneratorForms.toArray().forEach(f => {
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
    }
  }

  private showError(error: string): void {
    this.snackBarService.toggle(true, this.translate(error) || this.translateService.translate('errors.unknown_error'), {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24
    });
  }
}

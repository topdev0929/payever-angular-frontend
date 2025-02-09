import { ChangeDetectorRef, Component, Inject, } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AppThemeEnum, ContactsState, EnvService, PeDestroyService, ProductsState } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeDateTimePickerService } from '@pe/ui';
import { InvoiceEnvService } from '../../services/invoice-env.service';
import { Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { CommonService } from '../../services/common.service';
import * as moment from 'moment';
import { PaymentTerms, PriceFormats } from '../texteditor';
import { Select, Store } from '@ngxs/store';
import { UpsertItem } from '../../routes/grid/store/folders.actions';
import { PebInvoiceGridService } from '../../routes/grid/invoice-grid.service';
import { ProductsDialogService } from '../../services/products-dialog.service';
import { UploadMediaService } from '../../services/uploadMedia.service';
import { Router } from '@angular/router';
import { uniqBy, isEmpty } from 'lodash';
import { ContactsDialogService } from '../../services/contacts-dialog.service';


enum ThemesIcons {
  'datetime-picker' = 'datetime-picker-icon.svg',
}
@Component({
  selector: 'pe-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  providers: [PeDestroyService],
})
export class PeCreateInvoiceComponent {
  @Select(ProductsState.products) selectedProducts$: Observable<any>;
  @Select(ContactsState.contacts) selectedContacts$: Observable<any>;
  paymentTerms = PaymentTerms;
  priceFormats = PriceFormats;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  invoiceForm: FormGroup;
  currencyList: any[] =  [];
  languagesList: any[] =  [];
  contacts$: Observable<any[]> = this.commonService.getContacts();
  panelState: any = {customer: true};
  products: any[] = [];
  contacts: any[] = [];
  initialFiles: any[] = [];
  allowValidation: boolean;
  timer: any;

  errors = {
    customer: {
      name: 'Customer',
      hasError: false,
      errorMessage: ''
    },
    invoice_date: {
      name: 'Invoice date',
      hasError: false,
      errorMessage: ''
    },
    invoice_no: {
      name: 'Invoice No',
      hasError: false,
      errorMessage: ''
    },
    payment_terms: {
      name: 'Payment terms',
      hasError: false,
      errorMessage: ''
    },
    due_date: {
      name: 'Due date',
      hasError: false,
      errorMessage: ''
    },
    price_format: {
      name: 'Price format',
      hasError: false,
      errorMessage: ''
    },
    currency: {
      name: 'Currency',
      hasError: false,
      errorMessage: ''
    },
    products: {
      name: 'Products',
      hasError: false,
      errorMessage: ''
    }
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    @Inject(EnvService) protected envService: InvoiceEnvService,
    private router: Router,
    private commonService: CommonService,
    private fb: FormBuilder,
    private destroyed$: PeDestroyService,
    private overlay: PeOverlayWidgetService,
    private dateTimePicker: PeDateTimePickerService,
    private invoiceService: PebInvoiceGridService,
    private productDialogService: ProductsDialogService,
    private contactDialogService: ContactsDialogService,
    private cdr: ChangeDetectorRef,
    private api: PeInvoiceApi,
    private uploaderService: UploadMediaService,
    private store: Store,
    public iconRegistry: MatIconRegistry,
    public domSanitizer: DomSanitizer
  ) {
      Object.entries(ThemesIcons).forEach(([name, path]) => {
        iconRegistry.addSvgIcon(
          name,
          domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
        );
      });
    config.doneBtnCallback = this.addInvoice;
    this.currencyList = appData.currencies;
    this.languagesList = appData.languages;
    if(appData?.invoiceItems?.length) {
      appData.invoiceItems = this.commonService.mapProductData(appData.invoiceItems);
    }
    this.invoiceForm = this.fb.group({
      customer: [appData?.customer ? [appData?.customer] : [], Validators.required],
      invoice_date: [appData?.issueDate ? moment(appData?.issueDate).format('MM.DD.YYYY') : '', Validators.required],
      invoice_no: [appData?.reference || '', Validators.required],
      payment_terms: [appData?.paymentTerms || '7 days', Validators.required],
      due_date: [appData?.dueDate ? moment(appData?.dueDate).format('MM.DD.YYYY'): '', Validators.required],
      notes: [appData?.notes || ''],
      price_format: [appData?.invoiceOptions?.priceFormat || this.priceFormats.GROSS, Validators.required],
      discount: [appData?.invoiceOptions?.discount || ''],
      language: [appData?.invoiceOptions?.language || ''],
      currency: [appData?.invoiceOptions?.currency || 'EUR', Validators.required],
      exchange_rate: [appData?.invoiceOptions?.exchangeRate || ''],
      terms: [appData?.invoiceTerms || ''],
      attachments: [[]],
      products: [appData?.invoiceItems || [], Validators.required],
    }, { validator: [
      this.fromToDate('invoice_date', 'due_date')
    ]});

    if(appData?._id) {
      this.uploaderService.getAttachments(this.envService.businessId, appData._id).subscribe(files => {
        this.initialFiles = files;
        this.invoiceForm.get('attachments').patchValue(files);
      });
    }

    this.invoiceForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(data => {
      if (this.allowValidation) this.validateForms();
    })
  }

  ngOnInit() {
    this.contactDialogService.currentStatus.pipe(
      takeUntil(this.destroyed$),
      filter((isSaved: boolean) => isSaved),
      tap(() => {
        const contacts = this.store.selectSnapshot(ContactsState.contacts);
        contacts.map((element) => {
        this.commonService.getContactById(element.id).pipe(
          takeUntil(this.destroyed$))
          .subscribe(selectedContacts => {
          const contact = {
            image: selectedContacts?.image,
            name: selectedContacts.title,
            imageUrl: selectedContacts?.image,
            ...selectedContacts
          };
          const currContacts = this.invoiceForm.get('customer').value || [];
          const newContacts = [contact, ...currContacts];
          this.invoiceForm.get('customer').patchValue(uniqBy([newContacts[0] || []], 'id'));
        })
      })
      })
    ).subscribe();
    this.productDialogService.currentStatus.pipe(
      takeUntil(this.destroyed$),
      filter((isSaved: boolean) => isSaved),
      tap(() => {
        let products = this.store.selectSnapshot(ProductsState.products);
        products = products.map((element) => {
          return {
            image: element?.image,
            name: element.title,
            business: this.envService.businessId,
            sku: element.sku,
            imageUrl: element?.image,
            ...element
          };
        });
        const currProducts = this.invoiceForm.get('products').value || [];
        this.invoiceForm.get('products').patchValue(uniqBy([...currProducts, ...products], 'id'));
      })
    ).subscribe();
  }

  inputChanged(text) {
    if(text) {
      this.timer;
      if (this.timer){
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.commonService.getProductsList(text).subscribe(data => {
          this.products = data;
          this.cdr.detectChanges();
        });
      }, 250);
    } else {
      this.products = [];
      this.cdr.detectChanges();
    }
  }
  contactInputChanged(text) {
    if(text) {
      if (this.timer){
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.commonService.getContacts(text).subscribe(data => {
          this.contacts = data;
          this.cdr.detectChanges();
        });
      }, 250);
    } else {
      this.contacts = [];
      this.cdr.detectChanges();
    }
  }

  openDatepicker(event, controlName: string): void {
    let name = '';
    if (controlName === 'dateTimeFrom') {
      name = 'Date From';
    } else {
      name = 'Choose Date';
    }

    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      config: { headerTitle: name, range: false, maxDate: null },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date?.start) {
        const formatedDate = moment(date.start).format('MM.DD.YYYY');
        this.invoiceForm.get(controlName).patchValue(formatedDate);
      }
    });
  }
  fromToDate(fromDateField: string, toDateField: string, errorName: string = 'fromToDate'): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
        const fromDate = formGroup.get(fromDateField).value;
        const toDate = formGroup.get(toDateField).value;
       // Ausing the fromDate and toDate are numbers. In not convert them first after null check
        if ((fromDate !== null && toDate !== null) && moment(fromDate).isAfter(toDate)) {
            return {[errorName]: true};
        }
        return null;
    };
  }

  addInvoice = () => {
    this.allowValidation = true;
    this.validateForms();
    if (this.invoiceForm.invalid) return

    const formInfo = this.invoiceForm.value;

    const invoiceOptions = {
      ...(formInfo.price_format && {priceFormat: formInfo.price_format}),
      ...(formInfo.discount && {discount: formInfo.discount}),
      ...(formInfo.language && {language: formInfo.language}),
      ...(formInfo.currency && {currency: formInfo.currency}),
      ...(formInfo.exchange_rate && {exchangeRate: formInfo.exchange_rate})
    };
    const customer = {
      ...(formInfo.customer[0]?.name && {name: formInfo.customer[0]?.name}),
      ...(formInfo.customer[0]?.id && {contactId: formInfo.customer[0]?.id}),
      ...(formInfo.customer[0]?.business && {business: formInfo.customer[0]?.business}),
      ...(formInfo.customer[0]?.email && {email: formInfo.customer[0]?.email})
    };
    const payload = {
      ...(formInfo.payment_terms && {paymentTerms: formInfo.payment_terms}),
      issueDate: moment(formInfo.invoice_date).toDate(),
      reference: formInfo.invoice_no,
      invoiceTerms: formInfo.terms,
      dueDate: moment(formInfo.due_date).toDate(),
      notes: formInfo.notes,
      business: this.envService.businessId,
      invoiceItems: formInfo.products.map((item) => item.id),
      ...(!isEmpty(invoiceOptions) && {invoiceOptions}),
      ...(!isEmpty(customer) && {customer}),
    };

    let request = this.api.createInvoice(payload);
    if(this.appData._id) {
      request = this.api.updateInvoice(this.appData._id, payload);
    }
    request.subscribe((data) => {
      this.store.dispatch(new UpsertItem(this.invoiceService.invoiceMapper(data)));

      if(!formInfo.attachments[0]?._id) {
        if(formInfo.attachments && formInfo.attachments.length) {
          this.uploaderService.sendAttachments(formInfo.attachments.item(0), this.envService.businessId, data._id).subscribe();
        }
        if(this.initialFiles && this.initialFiles.length) {
          this.uploaderService.deleteAttachment(this.envService.businessId, this.initialFiles[0].name).subscribe();
        }
      }
      this.overlay.close();
    })
  }
  openProductDialog = () => {
    this.router.navigate([`/business/${this.envService.businessId}/invoice/add-product`] );
  }
  openContactDialog = () => {
    this.router.navigate([`/business/${this.envService.businessId}/invoice/add-contact`] );
  }

  panelStateTrigger(panel: string) {
    this.panelState = {[panel]: true};
    this.cdr.detectChanges();
  }

  validateForms() {
    if(this.invoiceForm.errors?.fromToDate) {
      this.errors['due_date'].errorMessage = `${this.errors['due_date'].name} must be after Invoice Date`;
    }
    for (let control in this.invoiceForm.controls) {

      if (this.invoiceForm.controls[control].invalid) {
        if(control === 'customer') {
          this.panelState.customer = true;
        }
        if(['invoice_date', 'invoice_no', 'payment_terms', 'due_date'].includes(control)) {
          this.panelState.details = true;
        }
        if([, 'outbox_userName', 'outbox_password', 'outbox_server', 'outbox_port', 'outbox_protection'].includes(control)) {
          this.panelState.outbox = true;
        }
        if(control === 'products') {
          this.panelState.items = true;
        }
        this.errors[control].hasError = true;
        if (this.invoiceForm.controls[control].errors.required) {
          this.errors[control].errorMessage = `${this.errors[control].name} is required`
        }
      } else if (this.errors[control]) {
        this.errors[control].hasError = false;
      }
      if(this.invoiceForm.errors?.fromToDate) {
        this.errors['due_date'].hasError = true;
        this.panelState.details = true;
      }
    }
    this.cdr.detectChanges();
  }
}

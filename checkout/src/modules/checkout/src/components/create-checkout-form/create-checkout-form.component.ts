import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Inject, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { finalize, take, takeUntil, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { ErrorBag, FormAbstractComponent, PeValidators } from '@pe/forms';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { EnvService, StorageService, UploaderService } from '../../services';
import { CheckoutFormInterface, CheckoutInterface } from '../../interfaces';

@Component({
  selector: 'checkout-create-form',
  templateUrl: './create-checkout-form.component.html',
  styleUrls: ['./create-checkout-form.component.scss'],
  providers: [ErrorBag],
  encapsulation: ViewEncapsulation.None
})
export class CreateCheckoutFormComponent extends FormAbstractComponent<CheckoutFormInterface> implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('logo') logoEl: ElementRef;
  @ViewChild('logoWrapper') logoWrapperEl: ElementRef;

  isNameInputFocused: boolean;
  theme = this.overlayData.theme;
  createMode = this.overlayData.createMode;
  isModal = this.overlayData.isModal;
  checkoutUuid = this.overlayData.checkoutUuid;

  currentCheckout$: Observable<CheckoutInterface> = this.stService.getCheckoutById(this.checkoutUuid).pipe(
    takeUntil(this.destroyed$),
    tap((checkout: CheckoutInterface) => this.currentCheckout = checkout)
  );

  showConfirmationModal: boolean;
  isCurrentCheckout = this.overlayData.isCurrentCheckout;
  submit$: Observable<number> = this.overlayData.submit$;
  onSaved$: BehaviorSubject<CheckoutInterface> = this.overlayData.onSaved$;
  onDeleted$: BehaviorSubject<boolean> = this.overlayData.onDeleted$;
  onLoading$: BehaviorSubject<boolean> = this.overlayData.onLoading$ || new BehaviorSubject(false);
  onFormValid$: BehaviorSubject<boolean> = this.overlayData.onFormValid$ || new BehaviorSubject(false);

  formChanges: Subject<any> = new Subject();

  private readonly isPictureLoadingSubject = new BehaviorSubject(false);
  readonly isPictureLoading$ = this.isPictureLoadingSubject.asObservable();

  isLargeThenParent = false;
  uploadProgress = 0;

  checkoutsNames: string[];
  currentCheckout: CheckoutInterface;
  businessUuid: FormControl = new FormControl();
  submitting: boolean;
  formStorageKey: string = 'checkout.new_checkout';

  inputLabel = this.translateService.translate('create_checkout.name.placeholder');

  readonly nameMaxLength: number = 40;

  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private envService: EnvService,
    private stService: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    protected formBuilder: FormBuilder,
    protected uploaderService: UploaderService,
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    super(injector);
  }

  ngOnInit() {
    if (this.submit$) {
      this.submit$.pipe(takeUntil(this.destroyed$))
        .subscribe(event => {
          if (event) {
            this.onSubmit();
            if (!this.form.valid) {
              timer(200).pipe(takeUntil(this.destroyed$)).subscribe(() => {
                this.onLoading$.next(false); // To reset loading in stepper
              });
            }
          }
        });
    }

    this.stService.getCheckouts().pipe(takeUntil(this.destroyed$))
      .subscribe(checkouts => this.checkoutsNames = checkouts?.length ? checkouts.map(checkout => checkout.name) : []);
  }

  get formScheme(): any {
    return {};
  }

  onLogoUpload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      this.isLargeThenParent = false;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';

      reader.onload = () => {
        this.isPictureLoadingSubject.next(true);
        this.uploaderService.uploadImageWithProgress('images', file, false).pipe(
          finalize(() => this.isPictureLoadingSubject.next(false)),
          takeUntil(this.destroyed$),
          tap((event) => {
            switch (event?.type) {
              case HttpEventType.UploadProgress: {
                this.uploadProgress = event.loaded;
                break;
              }
              case HttpEventType.Response: {
                this.form.get('logo').patchValue(event?.body?.blobName || reader.result as string);
                this.form.get('logo').markAsDirty();
                this.uploadProgress = 0;
                break;
              }
              default:
                break;
            }
          }),
        ).subscribe();
      };
    }
  }

  onLoad() {
    const logo: HTMLImageElement = this.logoEl.nativeElement;
    const logoWrapper: HTMLImageElement = this.logoWrapperEl.nativeElement;
    this.isLargeThenParent = logo.width >= logoWrapper.clientWidth || logo.height >= logoWrapper.clientHeight;
  }

  deleteImage() {
    this.form.controls.logo.patchValue('');
  }

  isFormNotChanged() {
    return this.form.controls.name?.value?.toLowerCase() === this.currentCheckout?.name.toLowerCase()
      && this.form.controls.logo.value === this.currentCheckout?.logo;
  }

  onDeleteButtonClick() {
    this.showConfirmationModal = true;
    const overlay = document.querySelector('.overlay-widget-container')?.children[0];
    overlay.classList.add('overlay-no-filter');
  }

  onConfirmModalClose() {
    this.showConfirmationModal = false;
    const overlay = document.querySelector('.overlay-widget-container')?.children[0];
    overlay.classList.remove('overlay-no-filter');
  }

  onCheckoutDelete() {
    this.onConfirmModalClose();
    this.onDeleted$.next(true);
  }

  protected onUpdateFormData(formsValues) {
    this.formChanges.next();
    this.onFormValid$.next(this.form.valid);
  }

  protected onSuccess() {
    if (this.createMode && this.isFormNotChanged()) {
      return;
    }
    if (!this.createMode && this.isFormNotChanged()) {
      this.onSaved$.next(this.currentCheckout);
      return;
    }
    if (this.submitting) {
      this.onLoading$.next(false);
      return;
    }
    this.submitting = true;
    this.onLoading$.next(true);

    const createCheckout: CheckoutInterface = {
      name: this.form.controls['name'].value,
      logo: this.form.controls['logo'].value || null,
      _id: null
    };
    if (!this.createMode) {
      this.stService.saveCheckout(this.checkoutUuid, createCheckout)
        .subscribe(
          checkout => {
            this.onSaved$.next(checkout);
            this.onLoading$.next(false);
            this.submitting = false;
          },
          (err: HttpErrorResponse) => {
            this.handleHttpError(err);
            this.submitting = false;
            this.onLoading$.next(false);
          }
        );
    } else {
      delete createCheckout._id;
      this.stService.addNewCheckout(createCheckout as CheckoutInterface).subscribe((newCheckout: CheckoutInterface) => {
          this.onSaved$.next(newCheckout);
          this.onLoading$.next(false);
          this.submitting = false;
        },
        (error: HttpErrorResponse) => {
          this.handleHttpError(error);
          this.submitting = false;
          this.onLoading$.next(false);
        });
    }
  }

  protected createForm(initialData: CheckoutFormInterface): void {
    setTimeout(() => {
      this.createFormDeffered(initialData);
    });
  }

  protected createFormDeffered(initialData: CheckoutFormInterface): void {
    let checkout: CheckoutInterface;
    if (!this.createMode) {
      this.currentCheckout$.pipe(take(1)).subscribe((currentCheckout: CheckoutInterface) => checkout = currentCheckout);
    }
    this.form = this.formBuilder.group({
      logo: {...checkout}.logo,
      name: [
        {...checkout}.name,
        [
          PeValidators.notEmptyStringValidator(),
          Validators.maxLength(this.nameMaxLength),
          this.forbiddenNameValidator(this.checkoutsNames)
        ]
      ]
    });

    this.changeDetectorRef.detectChanges();
  }

  private handleHttpError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.form.get('name')
        .setErrors({external: this.translateService.translate('create_checkout.checkoutNameExist')});
    }
    if (error.status === 403) {
      this.stService.showError(error.message);
    }
  }

  private forbiddenNameValidator(names: string[], checkout = this.currentCheckout): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = names.some(name => control.value?.toLowerCase() === name?.toLowerCase())
        && checkout?.name?.toLowerCase() !== control.value?.toLowerCase();
      return forbidden ? {forbiddenName: {value: control.value}} : null;
    };
  }
}

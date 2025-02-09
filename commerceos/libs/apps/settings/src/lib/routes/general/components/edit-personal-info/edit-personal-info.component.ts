import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { catchError, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { MediaService } from '@pe/media';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { PeDateTimePickerService } from '@pe/ui';

import { EMAIL_ADDRESS_PATTERN } from '../../../../misc/constants';
import {
  ApiService,
  BusinessEnvService,
  FormTranslationsService,
  ImagesUploaderService,
} from '../../../../services';

@Component({
  selector: 'peb-edit-personal',
  templateUrl: './edit-personal-info.component.html',
  styleUrls: ['./edit-personal-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    ImagesUploaderService,
  ],
})

export class EditPersonalInfoComponent implements OnInit {
  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public contactForm = this.formBuilder.group({
    salutation: [this.formTranslationsService.salutation],
    firstName: ['', [Validators.required, Validators.pattern(/[\S]/g)]],
    lastName: ['', [Validators.required, Validators.pattern(/[\S]/g)]],
    phone: ['', [Validators.pattern(/^\+\d{6,10}$/)]],
    email: [{ value: '', disabled: !!this.overlayData.data?.user?.email }, [Validators.pattern(EMAIL_ADDRESS_PATTERN)]],
    logo: [''],
    birthday: [''],
  });

  private filename: string;

  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.filename, 'images');
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private dateTimePicker: PeDateTimePickerService,
    private imageUpload: ImagesUploaderService,
    private mediaService: MediaService,
    private router: Router,
    private translationService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
    private envService: BusinessEnvService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    public formTranslationsService: FormTranslationsService,
  ) {
  }

  ngOnInit(): void {
    this.formTranslationsService.formTranslationNamespace = 'form.create_form.personal_information';

    if (this.overlayData.data.user) {
      const details = { ...this.overlayData.data.user };
      details.salutation = details.salutation || '';
      details.birthday = moment(details.birthday).format('DD.MM.YYYY');
      this.filename = details?.logo || null;
      this.contactForm.patchValue(details);
    }
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onSave() {
    if (this.contactForm.valid) {
      const newData = {
        salutation: this.contactForm.controls['salutation'].value,
        firstName: this.contactForm.controls['firstName'].value,
        lastName: this.contactForm.controls['lastName'].value,
        phone: this.contactForm.controls['phone'].value,
        email: this.contactForm.controls['email'].value,
        birthday: moment(this.contactForm.controls['birthday'].value, 'DD.MM.YYYY').toISOString(),
        logo: this.contactForm.controls['logo'].value,
      };
      this.overlayConfig.doneBtnTitle = this.translateService.translate('actions.onload');
      this.overlayConfig.isLoading = true;

      this.apiService.updateUserAccount(newData).pipe(
        tap(() => {
          this.overlayConfig.doneBtnTitle = this.translateService.translate('actions.save');
          this.overlayConfig.isLoading = false;
          this.peOverlayRef.close({ data: newData });
        }),
        takeUntil(this.destroy$),
        catchError((error) => {
          this.peOverlayRef.close();

          return EMPTY;
        }),
      ).subscribe();
    }
  }

  openDatepicker(event, controlName: string): void {
    let name: string;
    if (controlName === 'dateTimeFrom') {
      name = this.translateService.translate('form.create_form.personal_information.date_time.label');
    } else {
      name = this.translateService.translate('form.create_form.personal_information.birthday.label');
    }

    const minDate = moment().toDate();
    minDate.setFullYear(moment().year() - 100);

    const dialogRef = this.dateTimePicker.open(event, {
      config: { headerTitle: name, range: false, minDate },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date?.start) {
        const formatedDate = moment(date.start).format('DD.MM.YYYY');
        this.contactForm.get(controlName).patchValue(formatedDate);
      }
    });
  }

  uploadImage($event) {
    const file = $event[0];
    if (!file) {
      return;
    }

    this.imageUpload.uploadImages([file]).subscribe((res: any) => {
      if (res.type === 'data') {
        this.filename = res.data.uploadedImages[0].url;
        this.contactForm.controls.logo.patchValue(this.filename);
        this.cdr.detectChanges();
      }
    });
  }

  removeUser() {
    const headings: Headings = {
      title: this.translationService.translate('form.create_form.personal.delete_user_label'),
      subtitle: this.translationService.translate('form.create_form.personal.delete_user_question'),
      declineBtnText: this.translationService.translate('dialogs.item_delete.decline'),
      confirmBtnText: this.translationService.translate('dialogs.item_delete.confirm'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      switchMap((dismiss) => {
        if (dismiss === true) {
          return this.apiService.deleteUserAccount(this.envService.userAccount._id).pipe(
              tap(() => {
                this.peOverlayRef.close();
                this.router.navigate(['/login']);
              },
              catchError((error) => {
                this.snackbarService.toggle(true, {
                  content: error.message,
                  duration: 5000,
                  iconColor: '#E2BB0B',
                  iconId: 'icon-alert-24',
                  iconSize: 24,
                });

                return of(null);
              }),
            ),
          );
        }

        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}

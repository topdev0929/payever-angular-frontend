import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@pe/i18n-core';
import { MediaService } from '@pe/media';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PE_OVERLAY_SAVE, PeOverlayRef } from '@pe/overlay-widget';
import { PeDateTimePickerService } from '@pe/ui';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { ImagesUploaderService } from '../../services/images-uploader.service';
import { ApiService, CoreConfigService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-personal',
  templateUrl: './edit-personal-info.component.html',
  styleUrls: ['./edit-personal-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPersonalInfoComponent extends AbstractComponent implements OnInit {
  @ViewChild('filePicker') filePicker;
  salutation = [];
  filename: string;
  theme;
  data;
  contactForm: FormGroup;
  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.filename, 'images');
  }
  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private coreConfigService: CoreConfigService,
    private dateTimePicker: PeDateTimePickerService,
    private imageUpload: ImagesUploaderService,
    private mediaService: MediaService,
    private translateService: TranslateService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.theme = this.overlayConfig.theme;
    this.salutation = this.coreConfigService.salutation;

    this.contactForm =  this.formBuilder.group({
      salutation: [this.salutation],
      firstName: [''],
      lastName: [''],
      phone: [''],
      email: [''],
      logo: [''],
      birthday: [''],
    });
    if (this.overlayData.data.user) {
      this.data = this.overlayData.data.user;
      const details = this.overlayData.data.user;
      details.salutation = details.salutation || this.salutation[0];
      details.birthday = moment(details.birthday).format('DD.MM.YYYY');
      this.filename = details?.logo || null;
      this.contactForm.patchValue(details);
    }
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
  }

  onCheckValidity() {
    const value = this.contactForm.controls;

    value.salutation.setValidators([Validators.required]);
    value.salutation.updateValueAndValidity();

    value.lastName.setValidators([Validators.required]);
    value.lastName.updateValueAndValidity();

    value.firstName.setValidators([Validators.required]);
    value.firstName.updateValueAndValidity();

    value.phone.setValidators([Validators.pattern(/^\+[0-9]{6,10}/g)]);
    value.phone.updateValueAndValidity();

    value.email.setValidators([
      Validators.pattern(
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
      )]);
    value.email.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.contactForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.contactForm.valid) {
      const newData = {
        salutation: this.contactForm.controls['salutation'].value,
        firstName: this.contactForm.controls['firstName'].value,
        lastName: this.contactForm.controls['lastName'].value,
        phone: this.contactForm.controls['phone'].value,
        email: this.contactForm.controls['email'].value,
        birthday: this.contactForm.controls['birthday'].value,
        logo: this.contactForm.controls['logo'].value,
      };
      this.peOverlayRef.close({ data: newData });
    }
  }

  openDatepicker(event, controlName: string): void {
    let name = '';
    if (controlName === 'dateTimeFrom') {
      name = 'Date From';
    } else {
      name = this.translateService.translate('form.create_form.personal_information.birthday.label');
    }

    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
      config: { headerTitle: name, range: false },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date.start) {
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
}

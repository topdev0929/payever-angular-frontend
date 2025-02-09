import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PE_OVERLAY_SAVE, PeOverlayRef } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { MOBILE_PHONE_PATTERN } from '../../misc/constants/validation-patterns.constants';
import { ApiService, CoreConfigService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditContactComponent extends AbstractComponent implements OnInit, AfterViewInit {
  @ViewChild('picker') emailPicker;
  salutation = [];
  currentEmail: string;
  theme;
  data;
  contactForm: FormGroup;
  incorrectMail = false;
   constructor(
     @Inject(PE_OVERLAY_DATA) public overlayData: any,
     @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
     @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
     private formBuilder: FormBuilder,
     private apiService: ApiService,
     private peOverlayRef: PeOverlayRef,
     private cdr: ChangeDetectorRef,
     private coreConfigService: CoreConfigService,
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
       additionalPhone: [''],
       fax: [''],
       email: [''],
     });
     if (this.overlayData.data.details) {
       this.data = this.overlayData.data.business;
       const details = this.overlayData.data.details.contactDetails;
       details.salutation = details.salutation || this.salutation[0].value;
       this.contactForm.patchValue(details);
     }
     this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
       this.onCheckValidity();
     });
   }

   ngAfterViewInit() {
     this.data?.contactEmails.forEach(val => {
       this.emailPicker.onAddItem({ label: val, value: val });
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

    value.phone.setValidators([Validators.pattern(MOBILE_PHONE_PATTERN)]);
    value.phone.updateValueAndValidity();

    value.additionalPhone.setValidators([Validators.pattern(MOBILE_PHONE_PATTERN)]);
    value.additionalPhone.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.contactForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.contactForm.valid) {
      this.data['businessDetail'] = { contactDetails: this.contactForm.value };
      this.data.contactEmails = [];
      if (this.data.businessDetail.contactDetails?.email) {
        this.data.businessDetail.contactDetails.email.forEach(res => {
          this.data.contactEmails.push(res.label);
        });
      }
      this.peOverlayRef.close({ data: this.data });
    }
  }

  addEmail = () => {
    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (re.test(this.currentEmail)) {
      this.emailPicker.onAddItem({label: this.currentEmail, value: this.currentEmail});
      this.currentEmail = null;
      this.incorrectMail = false;
    } else if (this.currentEmail) {
      this.incorrectMail = true;
    }
  }

  onKeyUpPicker(e) {
    this.currentEmail = e;
  }
}

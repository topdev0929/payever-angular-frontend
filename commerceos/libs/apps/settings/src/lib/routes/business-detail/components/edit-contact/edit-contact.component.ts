import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PePickerComponent } from '@pe/ui';
import { TranslateService } from '@pe/i18n-core';
import { PeDestroyService } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { EMAIL_ADDRESS_PATTERN, DIGIT_FORBIDDEN_PATTERN, MOBILE_PHONE_PATTERN } from '../../../../misc/constants';
import { FormTranslationsService } from '../../../../services';

@Component({
  selector: 'peb-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditContactComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  @ViewChild('picker') emailPicker: PePickerComponent;

  public incorrectMail = false;
  public sameMail = false;
  private currentEmail: string;
  private data: any;

  public contactForm: FormGroup = this.formBuilder.group({
    salutation: [this.formTranslationsService.salutation, [Validators.required]],
    firstName: ['', [Validators.required, Validators.pattern(DIGIT_FORBIDDEN_PATTERN)]],
    lastName: ['', [Validators.required, Validators.pattern(DIGIT_FORBIDDEN_PATTERN)]],
    phone: ['', [Validators.pattern(MOBILE_PHONE_PATTERN)]],
    additionalPhone: ['', [Validators.pattern(MOBILE_PHONE_PATTERN)]],
    fax: [''],
    emails: [[]],
  });

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public formTranslationsService: FormTranslationsService,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.formTranslationsService.formTranslationNamespace = 'form.create_form.contact';

    if (this.overlayData.data.details) {
      this.data = this.overlayData.data.business;
      const details = this.overlayData.data.details.contactDetails;
      details.salutation = details.salutation || this.formTranslationsService.salutation[0].value;
      this.contactForm.patchValue(details);
    }

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onSave(): void {
    if (this.contactForm.valid) {
      this.data['businessDetail'] = { contactDetails: this.contactForm.value };
      this.data.contactEmails = [];
      if (this.data.businessDetail.contactDetails?.emails) {
        this.data.businessDetail.contactDetails.emails.forEach((res) => {
          this.data.contactEmails.push(res.label);
        });
      }
      this.peOverlayRef.close({ data: this.data });
    }
  }

  public addEmail(): void {
    const isUniqueEmail = !this.contactForm.value.emails
      .find(email => email.value?.toLowerCase() === this.currentEmail.toLowerCase());
    if (EMAIL_ADDRESS_PATTERN.test(this.currentEmail) && isUniqueEmail) {
      this.emailPicker.onAddItem({ label: this.currentEmail, value: this.currentEmail });
      this.currentEmail = null;
      this.incorrectMail = false;
      this.sameMail = false;
    } else if (this.currentEmail && !isUniqueEmail) {
      this.incorrectMail = false;
      this.sameMail = true;
    } else if (this.currentEmail) {
      this.incorrectMail = true;
      this.sameMail = false;
    }
  };

  public onKeyUpPicker(e: string): void {
    this.currentEmail = e;
  }

  public get emailErrorMessage(): string | null {
    if (this.incorrectMail) {
      return this.formTranslationsService.getFormControlErrorMessage('email');
    }
    if (this.sameMail) {
      return this.translateService.translate('form.create_form.errors.email_not_unique');
    }

    return null;
  }

  public fieldErrorMessage(formControlName: string): string | null {
    const control = this.contactForm.get(formControlName);

    if (control.errors?.required) {
      return this.translateService.translate('common.forms.validations.required');
    }
    if (control.errors?.pattern) {
      return this.translateService.translate('form.create_form.errors.pattern');
    }

    return null;
  }
}

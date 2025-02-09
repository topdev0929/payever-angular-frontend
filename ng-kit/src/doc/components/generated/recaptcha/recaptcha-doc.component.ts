import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ReCaptchaSizeEnum as SizeEnum, ReCaptchaThemeEnum as ThemeEnum } from '../../../../kit/recaptcha';

@Component({
  selector: 'recaptcha-doc',
  templateUrl: 'recaptcha-doc.component.html'
})
export class ReCaptchaDocComponent implements OnInit {
  htmlExample: string =  require('raw-loader!./examples/recaptcha-example-basic.html.txt');

  publicKey = '6LdIMMoUAAAAAKVUtUXgPMJbj3TLmzCPaoSnWles';

  formGroup: FormGroup;

  verified: string | boolean;

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.fb.group({
      compact: true,
      dark: true
    });
  }

  onVerified(verified: string | false): void {
    this.verified = verified;
    this.cdr.detectChanges();
  }

  getSize(): SizeEnum {
    return this.formGroup.get('compact').value ? SizeEnum.Compact : SizeEnum.Normal;
  }

  getTheme(): ThemeEnum {
    return this.formGroup.get('dark').value ? ThemeEnum.Dark : ThemeEnum.Light;
  }
}

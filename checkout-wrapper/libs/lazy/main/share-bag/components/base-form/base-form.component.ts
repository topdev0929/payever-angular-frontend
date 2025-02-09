import { Directive, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, mapTo, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { SendToDeviceService } from '@pe/checkout/sections/send-flow';
import { SettingsState } from '@pe/checkout/store';
import { CheckoutSettingsInterface } from '@pe/checkout/types';
import { SnackBarService } from '@pe/checkout/ui/snackbar';

import { ShareBagDialogService } from '../../services';


interface EmailFormPayload {
  email: string;
}

interface SmsFormPayload {
  recipient: string;
}

type FormPayload = EmailFormPayload | SmsFormPayload;

@Directive()
export abstract class BaseFormComponent implements OnInit, OnDestroy {

  @Select(SettingsState.settings) private settings$: Observable<CheckoutSettingsInterface>;

  @ViewChild('form') ngForm: NgForm;

  @Input() flowId: string;

  @Input() url: SafeUrl;

  protected fb = this.injector.get(FormBuilder);
  protected sendToDeviceService = this.injector.get(SendToDeviceService);
  private shareBagDialogService = this.injector.get(ShareBagDialogService);
  private snackbarService = this.injector.get(SnackBarService);

  public showInput: boolean;
  public className$: Observable<string>;

  protected abstract formGroup: FormGroup;
  protected abstract translations: { [key: string]: string };


  private readonly destroy$ = new Subject<void>();
  private readonly submitActionSubject$ = new Subject<FormPayload>();
  protected submitAction$: Observable<void>;

  constructor(protected injector: Injector) {}

  ngOnInit(): void {
    this.submitAction$ = this.submitActionSubject$.pipe(
      withLatestFrom(this.settings$),
      switchMap(([value, settings]) => {
        const message = (settings.message || '{{terminal_name}}: {{terminal_url}}')
          .split('{{terminal_name}}').join(settings.name)
          .split('{{terminal_url}}').join(String(this.url));

        return this.sendToDeviceService.sendToDevice(
          this.flowId,
          (value as EmailFormPayload).email,
          settings.phoneNumber,
          (value as SmsFormPayload).recipient,
          settings.name,
          message,
        );
      }),
      tap(() => {
        this.shareBagDialogService.close();
        this.snackbarService.show(this.translations.successSnackbar);
      }),
      mapTo(null),
      takeUntil(this.destroy$),
    );

    this.className$ = this.settings$.pipe(
      map(settings => settings.styles?.active ? 'mat-button-secondary' : 'mat-button-gradient'),
    );

    this.submitAction$.subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public submit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {
      this.submitActionSubject$.next(value);
    }
  }

  public submitBtn(): void {
    this.ngForm.onSubmit(undefined);
  }

  public getControl(name: string): FormControl {
    return this.formGroup.get(name) as FormControl;
  }
}

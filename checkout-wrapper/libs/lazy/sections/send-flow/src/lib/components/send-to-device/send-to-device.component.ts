import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { merge, of, Subject } from 'rxjs';
import { catchError, map, scan, startWith, switchMap, tap } from 'rxjs/operators';

import { emailRequiredValidator, emailValidator } from '@pe/checkout/forms/email';
import { FlowStorage, SendToDeviceStorage } from '@pe/checkout/storage';
import { FlowState, OpenNextStep, ParamsState, SetParams, SettingsState } from '@pe/checkout/store';
import { FlowInterface, CheckoutSettingsInterface } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';

import { SendToDeviceService } from '../../services';
import { phoneValidator } from '../../validators';

interface ViewModel {
  finished: boolean;
  loading: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencySymbolPipe],
  selector: 'checkout-main-send-to-device',
  templateUrl: 'send-to-device.component.html',
})
export class SendToDeviceComponent implements OnInit {

  @SelectSnapshot(ParamsState.embeddedMode) public embeddedMode: boolean;

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(SettingsState.settings) private settings: CheckoutSettingsInterface;

  public form = this.fb.group(
    {
      phoneTo: [null, [phoneValidator, Validators.required]],
      email: [null, [emailValidator]],
    },
  );

  private finishedSubject$ = new Subject<boolean>();
  private loadingSubject$ = new Subject<boolean>();
  public vm$ = merge(
    this.finishedSubject$.pipe(
      map(finished => ({ finished })),
    ),
    this.loadingSubject$.pipe(
      map(loading => ({ loading })),
    ),
  ).pipe(
    startWith({ finished: false, loading: false }),
    scan(
      (acc, curr) => ({ ...acc, ...curr }),
      {} as ViewModel,
    ),
  );

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private flowStorage: FlowStorage,
    private sendToDeviceService: SendToDeviceService,
    private sendToDeviceStorage: SendToDeviceStorage,
  ) {}

  ngOnInit(): void {
    if (this.settings.phoneNumber) {
      this.form.get('phoneTo').enable();
      this.form.get('email').setValidators([emailRequiredValidator]);
    } else {
      this.form.get('phoneTo').disable();
      this.form.get('email').setValidators([emailValidator]);
    }
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  onSkip(): void {
    this.store.dispatch(new OpenNextStep());
  }

  onSubmit(): void {
    const { valid, value: { phoneTo, email } } = this.form;

    if (valid) {
      this.loadingSubject$.next(true);

      this.sendToDeviceStorage.prapareAndSaveData({
        flow: this.flow,
        storage: this.flowStorage.getDump(this.flow.id),
        generate_payment_code: true,
        phone_number: phoneTo ?? '',
        source: phoneTo ? 'sms' : 'email',
        force_no_order: true,
        force_no_header: false,
        force_no_send_to_device: true,
      }).pipe(
        switchMap((code) => {
          const baseUrl: string = this.sendToDeviceStorage.makeLink(code, this.flow.channelSetId);

          let message: string = this.settings.message || '{{terminal_name}}: {{terminal_url}}';
          message = message.split('{{terminal_name}}').join(this.settings.name);
          message = message.split('{{terminal_url}}').join(baseUrl);
          const subject: string = this.settings.name;

          return this.sendToDeviceService.sendToDevice(
            this.flow.id,
            email,
            this.settings.phoneNumber,
            phoneTo,
            subject,
            message
          );
        }),
        catchError(() => {
          this.loadingSubject$.next(false);

          return of();
        }),
        tap(() => {
          this.loadingSubject$.next(false);
          this.finishedSubject$.next(true);
          this.store.dispatch(new SetParams({ cancelButtonText: $localize `:@@action.close:` }));
        }),
      ).subscribe();
    }
  }
}

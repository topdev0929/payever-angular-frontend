import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { merge, Observable, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';

import { VerificationTypeEnum } from '@pe/checkout/api';

import { ExternalCodeService, ExternalCodeViewModel } from '../../services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'payment-external-code',
  styleUrls: ['./payment-external-code.component.scss'],
  templateUrl: 'payment-external-code.component.html',
})
export class PaymentExternalCodeComponent implements OnInit {

  readonly verificationTypeEnum = VerificationTypeEnum;

  @Input() flowId: string = null;
  @Input() secondFactor: boolean = null;
  @Input() verificationType: VerificationTypeEnum = null;

  private externalCodeService = this.injector.get(ExternalCodeService);

  loading$: Observable<boolean>;
  vm$: Observable<ExternalCodeViewModel>;

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.vm$ = this.externalCodeService.getViewModel(
      this.flowId,
      this.secondFactor,
      this.verificationType,
    ).pipe(
      catchError(() => of(null)),
    );

    this.loading$ = merge(
      of(true),
      this.vm$.pipe(
        mapTo(false),
      ),
    );
  }
}

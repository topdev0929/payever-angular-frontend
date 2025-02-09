import { Directive, Injector, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { AbstractAction, PaymentSecurityCode } from '../../../../shared';

import { VerifyService } from './verify.service';

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class AbstractVerifyAction extends AbstractAction implements OnInit {
  field: PaymentSecurityCode;
  form: FormGroup;
  isSubmitted = false;

  abstract errorKeyValue: string;

  readonly destroy$ = this.injector.get(PeDestroyService);
  readonly verifyService = this.injector.get(VerifyService);

  constructor(
    protected injector: Injector,
  ) {
    super(injector);
  }

  abstract onSubmit(): void;

  ngOnInit(): void {
    merge(
      this.verifyService.field$.pipe(
        tap(field => this.field = field),
      ),
      this.verifyService.verifications$.pipe(
        tap(() => this.onSubmit()),
      )
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.getData();

    this.verifyService.emitErrorKey(this.errorKeyValue);
  }

  createForm() {
    // prevent sonar and eslint errors
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Actions, ofActionCompleted, ofActionDispatched, Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { FormInitDataInterface } from '@pe/checkout/analytics';
import { SaveProgressHelperService } from '@pe/checkout/core';
import { FlowState, ParamsState, PatchFlow } from '@pe/checkout/store';
import { CheckoutStateParamsInterface, FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { tabValidator } from '../../validators';

interface AmountInterface {
  amount?: number;
  reference?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-amount-edit-form',
  templateUrl: 'amount-edit-form.component.html',
  styleUrls: ['./amount-edit-form.component.scss'],
  providers: [PeDestroyService],
})
export class AmountEditFormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  @SelectSnapshot(ParamsState.params) params!: CheckoutStateParamsInterface;

  @Input() set submitText(value: string) {
    this._submitText = value ?? $localize `:@@amount.action.continue:`;
  }

  get submitText(): string {
    return this._submitText;
  }

  @Output() submitSuccess: EventEmitter<FlowInterface> = new EventEmitter();

  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  @Output() globalLoading: EventEmitter<boolean> = new EventEmitter();

  public loading$ = merge(
    this.actions$.pipe(
      ofActionDispatched(PatchFlow),
      map(() => true),
    ),
    this.actions$.pipe(
      ofActionCompleted(PatchFlow),
      map(() => false),
    ),
  );

  public form: FormGroup;
  public analyticFormData: FormInitDataInterface;

  private _submitText: string;

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private saveProgressHelperService: SaveProgressHelperService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    this.createForm();

    this.saveProgressHelperService.trigger$.pipe(
      tap((data) => {
        if (data.flowId !== this.flow.id) { return }
        this.onSubmit();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.submit().subscribe();
    }
  }

  private createForm(): void {
    const { forceHideReference, editMode } = this.params;

    this.form = this.fb.group(
      {
        amount: [this.flow.amount || '', [
          Validators.required, Validators.min(1),
          Validators.max(Number.MAX_SAFE_INTEGER),
        ]],
        reference: [this.flow.reference || '', forceHideReference ? [] : [tabValidator($localize`:@@checkout_cart_edit.form.label.reference:`)]],
      },
    );

    if (forceHideReference && !editMode) {
      this.form.get('reference').disable();
    }
  }

  private submit(): Observable<void> {
    const data: AmountInterface = {
      amount: this.form.get('amount').value,
      reference: this.clearText(this.form.get('reference').value),
    };

    return this.store.dispatch(new PatchFlow({ id: this.flow.id, ...data })).pipe(
      tap(() => {
        const flow = this.store.selectSnapshot(FlowState.flow);
        this.submitSuccess.emit(flow);
      }),
    );
  }

  private clearText(text: string): string {
    return text.replace('<', '&lt;').replace('>', '&gt;');
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Actions, ofActionCompleted, ofActionDispatched, Select, Store } from '@ngxs/store';
import { BehaviorSubject, defer, merge, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  map,
  scan,
  startWith,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { v4 as uuidV4 } from 'uuid';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PluginEventsService } from '@pe/checkout/plugins';
import { FlowState, OpenNextStep, PatchFlow } from '@pe/checkout/store';
import {
  CartItemInterface,
  FlowInterface,
  PaymentMethodEnum,
  SelectOptionInterface,
} from '@pe/checkout/types';
import { CustomElementService, LocaleConstantsService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { ProductsApiService, ProductsService } from '../../services';

interface ViewModel {
  total: number;
  currency: string;
  loading: boolean;
  submitted: boolean;
}

@Component({
  selector: 'checkout-main-products-edit-form',
  templateUrl: 'products-edit-container.component.html',
  styleUrls: ['./products-edit-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditContainerComponent implements OnInit {

  @Select(FlowState.flow) public flow$!: Observable<FlowInterface>;

  @Input() paymentMethod: PaymentMethodEnum;

  @Input() submitText = $localize`:@@amount.action.continue:`;

  @ViewChild(FormGroupDirective) ngForm: NgForm;

  get rows(): FormGroup[] {
    return this.formArray.controls;
  }

  get isCategoryEnabled(): boolean {
    return !!this.paymentMethod;
  }

  public readonly isPreparingData$ = new BehaviorSubject<boolean>(false);
  public readonly numberOptions = Array.from({ length: 1000 }, (_, i) => i + 1);
  public readonly categories$ = this.getCategories();

  public formArray = this.fb.array<FormGroup>([]);
  public formGroup = this.fb.group({
    products: this.formArray,
  });

  private readonly localeConfig = this.localeConstantsService.getLocaleConfig();

  private cart$ = defer(() => this.formArray.valueChanges.pipe(
    startWith(this.formArray.value),
    filter(value => !!value.length),
    map(value => this.productsService.mapToCart(value)),
  ));

  private total$ = this.cart$.pipe(
    map(cart => cart.reduce((acc, curr) => acc += curr.price * curr.quantity, 0)),
  );

  private loading$ = merge(
    this.isPreparingData$,
    this.actions$.pipe(
      ofActionDispatched(PatchFlow),
      map(() => true),
    ),
    this.actions$.pipe(
      ofActionCompleted(PatchFlow),
      map(() => false),
    ),
  );

  private submitSubject$ = new Subject<void>();

  public vm$: Observable<ViewModel> = merge(
    this.total$.pipe(
      map(total => ({ total })),
    ),
    this.loading$.pipe(
      map(loading => ({ loading })),
    ),
    this.submitSubject$.pipe(
      map(() => ({ submitted: true })),
    ),
    this.flow$.pipe(
      map(flow => ({ currency: flow.currency })),
    ),
  ).pipe(
    scan(
      (acc, curr) => ({ ...acc, ...curr }),
      {
        currency: null,
        loading: false,
        submitted: false,
        total: 0,
      } as ViewModel,
    ),
  );

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private analyticsFormService: AnalyticsFormService,
    private productsApiService: ProductsApiService,
    private pluginEventsService: PluginEventsService,
    private productsService: ProductsService,
    private localeConstantsService: LocaleConstantsService,
    private destroy$: PeDestroyService,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['x-solid-24', 'plus-softy-16'],
      null,
      this.customElementService.shadowRoot,
    );
    (window as any).PayeverStatic?.IconLoader?.loadIcons(
      ['checkout'],
      null,
      this.customElementService.shadowRoot,
    );
  }

  ngOnInit(): void {
    this.initForm();
  }

  public trackByFn(_: number, item: FormGroup): string {
    const { productId } = item.value;

    return productId;
  }

  public addItem(): void {
    this.formArray.push(this.createFormRow());
  }

  public removeItem(index: number): void {
    this.formArray.removeAt(index);
  }

  public submit(): void {
    const { valid, value } = this.formArray;
    this.ngForm.ngSubmit.emit();
    this.ngForm.onSubmit(null);

    if (valid) {
      this.productsService.patchFlow(value).pipe(
        tap(() => {
          const flow = this.store.selectSnapshot(FlowState.flow);
          this.pluginEventsService.emitCart(flow.id, flow.cart);
          this.store.dispatch(new OpenNextStep());
        }),
        map(() => true),
        catchError(() => of(false)),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  private createFormRow(initialData?: CartItemInterface): FormGroup {
    return this.fb.group({
      name: [initialData?.name, Validators.required],
      price: [initialData?.price, Validators.required],
      category: [
        { value: initialData?.extraData?.category, disabled: !this.isCategoryEnabled },
        Validators.required,
      ],
      quantity: [initialData?.quantity ?? 1, Validators.required],
      productId: [initialData?.productId ?? uuidV4()],
    });
  }

  private initForm(): void {
    this.formArray = this.fb.array<FormGroup>([]);

    const flow = this.store.selectSnapshot(FlowState.flow);
    const initialCart = flow.cart?.length ? flow.cart : [{}];
    initialCart.forEach((item: CartItemInterface) => {
      this.formArray.push(this.createFormRow(item));
    });
    this.formArray.setParent(this.formGroup);
  }

  private getCategories(): Observable<SelectOptionInterface[]> {
    const { connectionId, id } = this.store.selectSnapshot(FlowState.flow);
    this.isPreparingData$.next(true);

    return this.productsApiService.getCategories(
      connectionId,
      this.isCategoryEnabled,
      id
    ).pipe(
      finalize(() => {
        this.isPreparingData$.next(false);
      }),
    );
  }
}

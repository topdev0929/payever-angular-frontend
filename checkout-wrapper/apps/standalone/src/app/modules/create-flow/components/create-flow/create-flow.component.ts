import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, take, tap } from 'rxjs/operators';

import { CreateFlowParamsInterface } from '@pe/checkout/api';
import { MediaApiService } from '@pe/checkout/api/media';
import { LoaderService } from '@pe/checkout/core/loader';
import { ProductsStateService } from '@pe/checkout/products';
import { AuthSelectors, CreateFlow, FlowState, GetSettings } from '@pe/checkout/store';
import { AddressInterface, FlowInterface, CartItemInterface } from '@pe/checkout/types';

enum MediaContainerType {
  Products = 'products',
  Builder = 'builder',
  Images = 'images',
  Wallpapers = 'wallpapers'
}

enum MediaUrlTypeEnum {
  Regular = 'regular',
  Thumbnail = 'thumbnail',
  GridThumbnail = 'grid-thumbnail',
  Blurred = 'blurred',
  BlurredThumbnail = 'blurred-thumbnail'
}


const USER_INFO_ADDRESS_MAP: { [key: string]: keyof AddressInterface } = {
  salutation: 'salutation',
  firstName: 'firstName',
  lastName: 'lastName',

  email: 'email',
  country: 'country',
  city: 'city',
  street: 'street',
  phone_number: 'phone',
  zipCode: 'zipCode',
  organizationName: 'organizationName',

  'address.email': 'email',
  'address.country': 'country',
  'address.city': 'city',
  'address.street': 'street',
  'address.phone_number': 'phone',
  'address.zipCode': 'zipCode',
  'address.organizationName': 'organizationName',
};

@Component({
  selector: 'create-flow',
  template: '',
})
export class CreateFlowComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) flow: FlowInterface;

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  private cart$ = new Observable<CartItemInterface[]>().pipe(
    startWith([]),
  );

  private activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  private loaderService: LoaderService = this.injector.get(LoaderService);
  private router: Router = this.injector.get(Router);
  private store = this.injector.get(Store);
  private productsStateService = this.injector.get(ProductsStateService);
  private mediaApiService = this.injector.get(MediaApiService);

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const createFlowParams = this.getCreateFlowParams(queryParams);
    const forceNoOrder = queryParams.forceNoOrder === 'true';

    if (createFlowParams?.cartIds?.length) {
      this.cart$ = this.productsStateService.getProductsOnce(createFlowParams.cartIds, true).pipe(
        map(products => products.map(product => ({
          id: product.id,
          productId: product.id,
          quantity: 1,
          price: product.price,
          name: product.title,
          image: product.images?.length
            && this.mediaApiService.getMediaUrl(
              product.images[0],
              MediaContainerType.Products,
              MediaUrlTypeEnum.Thumbnail
            ),
        })))
      );

      delete createFlowParams.cartIds;
    }

    this.createFlow(createFlowParams, forceNoOrder);
  }

  private createFlow(
    createFlowParams: CreateFlowParamsInterface,
    forceNoOrder: boolean,
  ): void {

    this.loaderService.loaderGlobal = true;

    this.cart$.pipe(
      switchMap((cart) => {
        createFlowParams.cart = cart;

        return this.store.dispatch([
          new CreateFlow(createFlowParams),
          new GetSettings(createFlowParams.channelSetId, null),
        ]).pipe(
          tap(() => {
            this.router.navigate(
              [`/pay/${this.flow.id}`],
              {
                queryParams: {
                  forceNoOrder,
                  ...this.guestTokenQueryParam,
                },
              },
            );
          }),
        );
      }),
      take(1),
    ).subscribe();
  }

  private getCreateFlowParams(queryParams: Params): CreateFlowParamsInterface {
    const billingAddress = Object.entries(USER_INFO_ADDRESS_MAP).reduce((acc, [from, to]) => {
      if (queryParams[from]) {
        acc[to] = (queryParams[from]);
      }

      return acc;
    }, {} as any);

    return {
      channelSetId: this.activatedRoute.snapshot.params.channelSetId,
      amount: parseFloat(queryParams.amount),
      reference: queryParams.reference,
      phoneNumber: queryParams.phone_number || queryParams.phoneNumber,
      source: queryParams.source || 'frontend',
      generatePaymentCode: queryParams.generatePaymentCode === 'true',
      paymentCodeId: queryParams.code_id || queryParams.codeId,
      cartIds: queryParams.cart ? queryParams.cart.split(',') : null,
      merchantMode: !!queryParams?.merchantMode,
      ...Object.keys(billingAddress).length && { billingAddress },
    };
  }
}

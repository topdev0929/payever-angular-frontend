import {
  PebGridCellCategoryElement,
  PebGridCellElement,
  PebGridCellFilterSelectElement,
  PebGridCellProductElement,
  PebGridCellSortSelectElement,
  PebGridElement,
  PebShapeElement,
  PebShapeMakerElement,
  PebTextElement,
  PebTextMakerElement,
} from '@pe/builder-base-plugins';

export const pebSubscriptionElementsConfig = {
  elements: {
    lazy: {
      block: () => import('@pe/builder-base-plugins').then((m: any) => m.PebBlockMakerElement),
      button: () => import('@pe/builder-base-plugins').then((m: any) => m.PebButtonElement),
      carousel: () => import('@pe/builder-base-plugins').then((m: any) => m.PebCarouselElement),
      html: () => import('@pe/builder-base-plugins').then((m: any) => m.PebHtmlElement),
      image: () => import('@pe/builder-base-plugins').then((m: any) => m.PebImageElement),
      line: () => import('@pe/builder-base-plugins').then((m: any) => m.PebLineElement),
      logo: () => import('@pe/builder-base-plugins').then((m: any) => m.PebLogoElement),
      menu: () => import('@pe/builder-base-plugins').then((m: any) => m.PebMenuElement),
      script: () => import('@pe/builder-base-plugins').then((m: any) => m.PebScriptElement),
      section: () => import('@pe/builder-base-plugins').then((m: any) => m.PebSectionElement),
      'social-icon': () => import('@pe/builder-base-plugins').then((m: any) => m.PebSocialIconElement),
      video: () => import('@pe/builder-base-plugins').then((m: any) => m.PebVideoElement),
      group: () => import('@pe/builder-base-plugins').then((m: any) => m.PebGroupElement),

      'shop-cart': () => import(`@pe/builder-shop-plugins/elements/cart/client`).then((m: any) => m.PebShopCartElement),
      'shop-category': () =>
        import('@pe/builder-shop-plugins/elements/category/client').then((m: any) => m.PebShopCategoryElement),
      'shop-product-details': () =>
        import('@pe/builder-shop-plugins/elements/product-details/client').then(
          (m: any) => m.PebShopProductDetailsElement,
        ),
      'shop-products': () =>
        import('@pe/builder-shop-plugins/elements/product-grid/client').then((m: any) => m.PebShopProductsElement),
      'pos-catalog': () =>
        import('@pe/builder-shop-plugins/elements/catalog/client').then((m: any) => m.PebPosCatalogElement),
      languages: () =>
        import('@pe/builder-shop-plugins/elements/languages/client').then((m: any) => m.PebShopLanguagesElement),
    },
    preloaded: {
      grid: PebGridElement,
      'grid-cell': PebGridCellElement,
      'grid-cell-product': PebGridCellProductElement,
      'grid-cell-category': PebGridCellCategoryElement,
      'grid-cell-filter-select': PebGridCellFilterSelectElement,
      'grid-cell-sort-select': PebGridCellSortSelectElement,
      shape: PebShapeMakerElement,
      text: PebTextMakerElement,
    },
    client: {
      shape: PebShapeElement,
      text: PebTextElement,
    },
  },
};

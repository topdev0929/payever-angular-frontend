import { PebDocumentElement } from '@pe/builder-base-plugins/elements/document/client';
import { PebGroupElement } from '@pe/builder-base-plugins/elements/group/client';
import {
  PebGridCellCategoryElement,
  PebGridCellElement,
  PebGridCellFilterSelectElement,
  PebGridCellProductElement,
  PebGridCellSortSelectElement,
  PebGridElement,
} from '@pe/builder-base-plugins/elements/grid/client';
import { PebSectionElement } from '@pe/builder-base-plugins/elements/section/client';
import { PebShapeElement } from '@pe/builder-base-plugins/elements/shape/client';
import { PebTextElement } from '@pe/builder-base-plugins/elements/text/client';

export const pebPosElementsConfig = {
  elements: {
    lazy: {
      button: () => import('@pe/builder-base-plugins/elements/button/client').then(m => m.PebButtonElement),
      carousel: () => import('@pe/builder-base-plugins/elements/carousel/client').then(m => m.PebCarouselElement),
      html: () => import('@pe/builder-base-plugins/elements/html/client').then(m => m.PebHtmlElement),
      image: () => import('@pe/builder-base-plugins/elements/image/client').then(m => m.PebImageElement),
      line: () => import('@pe/builder-base-plugins/elements/line/client').then(m => m.PebLineElement),
      logo: () => import('@pe/builder-base-plugins/elements/logo/client').then(m => m.PebLogoElement),
      menu: () => import('@pe/builder-base-plugins/elements/menu/client').then(m => m.PebMenuElement),
      script: () => import('@pe/builder-base-plugins/elements/script/client').then(m => m.PebScriptElement),
      shape: () => import('@pe/builder-base-plugins/elements/shape/client').then(m => m.PebShapeElement),
      'social-icon': () => import('@pe/builder-base-plugins/elements/social-icon/client')
        .then(m => m.PebSocialIconElement),
      video: () => import('@pe/builder-base-plugins/elements/video/client').then(m => m.PebVideoElement),

      'shop-cart': () => import('@pe/builder-shop-plugins/elements/cart/client').then(m => m.PebShopCartElement),
      'shop-category': () => import('@pe/builder-shop-plugins/elements/category/client')
        .then(m => m.PebShopCategoryElement),
      'shop-product-details': () => import('@pe/builder-shop-plugins/elements/product-details/client')
        .then(m => m.PebShopProductDetailsElement),
      'shop-products': () => import('@pe/builder-shop-plugins/elements/product-grid/client')
        .then(m => m.PebShopProductsElement),
      'pos-catalog': () => import('@pe/builder-shop-plugins/elements/catalog/client').then(m => m.PebPosCatalogElement),
      languages: () => import('@pe/builder-shop-plugins/elements/languages/client')
        .then(m => m.PebShopLanguagesElement),
    },
    preloaded: {
      document: PebDocumentElement,
      grid: PebGridElement,
      'grid-cell': PebGridCellElement,
      'grid-cell-product': PebGridCellProductElement,
      'grid-cell-category': PebGridCellCategoryElement,
      'grid-cell-filter-select': PebGridCellFilterSelectElement,
      'grid-cell-sort-select': PebGridCellSortSelectElement,
      group: PebGroupElement,
      section: PebSectionElement,
      shape: PebShapeElement,
      text: PebTextElement,
    },
  },
};

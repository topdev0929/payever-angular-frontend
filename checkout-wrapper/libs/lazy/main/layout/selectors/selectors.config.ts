import { ComponentRef } from '@angular/core';

import { LayoutSelectorConfig } from '../models';

export const LAYOUT_SELECTOR_CONFIG: LayoutSelectorConfig = {
  accordion: {
    header: {
      import: () => import('../accordion/header')
        .then(m => m.AccordionHeaderModule),
    },
    main: {
      import: () => import('../accordion/main')
        .then(m => m.AccordionMainModule),
      init: (compRef: ComponentRef<any>, inputs: any) =>
        import('../accordion/main')
          .then(m => m.flowAccordionInit(compRef, inputs)),
    },
  },
  order: {
    header: {
      import: () => import('../order/header')
        .then(m => m.OrderHeaderModule),
    },
    main: {
      import: () => import('@pe/checkout/main/selectors/order')
        .then(m => m.OrderModuleMain),
        init: (compRef, inputs) => import('../order/main')
          .then(m => m.init(compRef, inputs)),
    },
  },
};

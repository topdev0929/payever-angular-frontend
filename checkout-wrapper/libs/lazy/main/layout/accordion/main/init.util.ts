import { ComponentRef } from '@angular/core';

export const flowAccordionInit = (
  componentRef: ComponentRef<any>,
  inputs: {
    asCustomElement: boolean,
  },
) => {
  const { instance } = componentRef;
  instance.asCustomElement = inputs.asCustomElement;
  componentRef.hostView.markForCheck();

  return instance;
};

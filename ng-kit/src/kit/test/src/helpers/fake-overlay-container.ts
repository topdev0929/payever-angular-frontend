import { OverlayContainer } from '@angular/cdk/overlay';
import { Provider } from '@angular/core';

export interface FakeOverlayContainer {
  overlayContainerElement: HTMLDivElement;
  fakeElementContainerProvider: Provider;
}

export const fakeOverlayContainer: () => FakeOverlayContainer = () => {
  const overlayContainerElement: HTMLDivElement = document.createElement('div');
  overlayContainerElement.classList.add('fake-overlay-container');

  return {
    overlayContainerElement,
    fakeElementContainerProvider: {
      provide: OverlayContainer,
      useFactory: () => ({
        getContainerElement: () => overlayContainerElement
      })
    },
  };
};

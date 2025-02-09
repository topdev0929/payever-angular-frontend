import { resetToolBarItems, activeElement } from './tool-bar';

export const outSideClickHandler = (): void=> {
  document.addEventListener('click', (e) => {
    if (activeElement && !activeElement.contains(e.target as Node)) {
      resetToolBarItems();
    }
  });
};
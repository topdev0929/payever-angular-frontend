/* tslint:disable */
export class Panel {
  element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
  }

  show(src: string, title: string): string {
    return this.baseShow();
  }

  baseShow(): string {
    let max = 0;

    const elements: NodeListOf<HTMLElement> = document.querySelectorAll('body *');

    for (let i = 0; i < elements.length; ++i) {
      const element: HTMLElement = elements[i];
      if (element === this.element) {
        continue;
      }

      const { zIndex } = window.getComputedStyle(element);
      if (zIndex === 'auto') {
        continue;
      }
      max = Math.max(max, parseFloat(zIndex));
    }

    // 200000 is z-index for `.cdk-overlay-container` that is used for modals, datepickers, etc.
    return this.element.style.zIndex = (Math.min(200000 - 1, max + 1)).toString();
  }
}

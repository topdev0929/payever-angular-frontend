import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomElementService {
  elementRef: ElementRef<HTMLElement>;

  public get shadowRoot(): ShadowRoot | null {
    return this.elementRef?.nativeElement?.shadowRoot ?? null;
  }
}

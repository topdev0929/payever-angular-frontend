import { Directive, ElementRef, Output } from '@angular/core';
import { Observable } from 'rxjs';

export function fromResizeObserver(
  element: HTMLElement,
): Observable<ResizeObserverEntry> {
  return new Observable((sub) => {
    const observer = new ResizeObserver((entries) => {
      sub.next(entries[0]);
    });

    observer.observe(element);

    return () => observer.disconnect();
  });
}

@Directive({
  selector: '[resized]',
  standalone: true,
})
export class ResizeDirective {

  constructor(private elementRef: ElementRef) {}

  @Output() resized = fromResizeObserver(this.elementRef.nativeElement);
}

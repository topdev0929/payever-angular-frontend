import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

export function fromIntersectionObserver(element: ElementRef | HTMLElement) {
  return new Observable<IntersectionObserverEntry>((sub) => {
    const observer = new IntersectionObserver((entries) => {
      sub.next(entries[0]);
    });

    const el = element instanceof ElementRef ? element.nativeElement : element;
    observer.observe(el);

    return () => observer.disconnect();
  });
}

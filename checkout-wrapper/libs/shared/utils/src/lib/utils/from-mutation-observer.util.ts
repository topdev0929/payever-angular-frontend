import { Observable } from 'rxjs';

export function fromMutationObserver(
  element: HTMLElement,
  config: MutationObserverInit = {
    childList: true,
  }
): Observable<MutationRecord[]> {
  return new Observable((sub) => {
    const observer = new MutationObserver((mutations) => {
      sub.next(mutations);
    });

    observer.observe(element, config);

    return () => observer.disconnect();
  });
}

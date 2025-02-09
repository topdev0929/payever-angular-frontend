import { Observable } from 'rxjs';

export function loadScript(url: string, id: string): Observable<boolean> {
  return new Observable((sub) => {
    const scriptTag = document.getElementById(id) as HTMLScriptElement;
    if (scriptTag) {
      sub.next(true);
      sub.complete();
    } else {
      const script: HTMLScriptElement = document.createElement('script');
      script.id = id;
      script.src = url;
      script.onload = () => {
        sub.next(true);
        sub.complete();
      };
      script.onerror = (err) => {
        sub.error(err);
      };
      document.head.appendChild(script);
    }
  });
}

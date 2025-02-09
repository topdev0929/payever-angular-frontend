import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderSubject = new ReplaySubject<boolean>(1);
  private loaderGlobalSubject = new ReplaySubject<boolean>(1);

  get loader$(): Observable<boolean> {
    return this.loaderSubject.asObservable();
  }

  get loaderGlobal$(): Observable<boolean> {
    return this.loaderGlobalSubject.asObservable();
  }

  set loader(value: boolean) {
    this.loaderSubject.next(value);
  }

  set loaderGlobal(value: boolean) {
    this.loaderGlobalSubject.next(value);
  }
}

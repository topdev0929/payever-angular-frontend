import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

@Injectable()
/**
 * @deprecated Unused service
 */
export class InfoBoxService {

  private hasBlurBackdropSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);
  private loadingSubject: Subject<boolean> = new Subject<boolean>();

  get hasBlurBackdrop$(): Observable<boolean> {
    return this.hasBlurBackdropSubject.asObservable();
  }

  set hasBlurBackdrop(value: boolean) {
    this.hasBlurBackdropSubject.next(value);
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  set loading(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }

}

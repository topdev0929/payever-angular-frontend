import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PeMessageEnvService {
  private businessIdStream$ = new BehaviorSubject<string>('');
  businessId$ = this.businessIdStream$.asObservable();
  get businessId(): string {
    return this.businessIdStream$.value;
  }
  set businessId(businessId: string) {
    this.businessIdStream$.next(businessId);
  }

  private businessDataStream$ = new BehaviorSubject<any>({});
  businessData$ = this.businessDataStream$.asObservable();
  get businessData(): any {
    return this.businessDataStream$.value;
  }
  set businessData(businessData: any) {
    this.businessDataStream$.next(businessData);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SandboxEnv {

  protected businessUuidStorage$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  set businessUuid(value: string) {
    this.businessUuidStorage$.next(value);
  }

  get businessUuid(): string {
    return this.businessUuidStorage$.value;
  }

  businessUuid$: Observable<string> = this.businessUuidStorage$.asObservable();

  private businessDataValue$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get businessData(): any {
    return this.businessDataValue$.value;
  }

  set businessData(business: any) {
    this.businessDataValue$.next(business);
  }

  protected isPersonalModeStorage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  get isPersonalMode(): boolean {
    return this.isPersonalModeStorage$.getValue();
  }

  set isPersonalMode(isPersonal: boolean) {
    this.isPersonalModeStorage$.next(isPersonal);
  }

  public isPersonalMode$: Observable<boolean> = this.isPersonalModeStorage$.asObservable();

}

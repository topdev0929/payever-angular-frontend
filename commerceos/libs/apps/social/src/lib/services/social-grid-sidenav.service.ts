import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PeSocialGridSideNavService {
  private readonly sideNavToggleStream$ = new Subject<boolean>();
  public readonly sideNavToggle$ = this.sideNavToggleStream$.asObservable();

  set sideNavToggle(active: boolean){
    this.sideNavToggleStream$.next(active);
  }
}

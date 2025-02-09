import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private showOrderSubject$ = new BehaviorSubject<boolean>(false);
  public showOrder$ = this.showOrderSubject$.pipe(
    shareReplay(1),
  );

  toggleShowOrder(value?: boolean): void {
    this.showOrderSubject$.next(value ?? !this.showOrderSubject$.getValue());
  }
}

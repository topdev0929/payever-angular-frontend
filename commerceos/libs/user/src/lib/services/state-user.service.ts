import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateUserService {
  isNewUser$ = new BehaviorSubject<boolean>(false);
}

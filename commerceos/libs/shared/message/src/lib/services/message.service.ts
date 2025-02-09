import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class MessageService {
  readonly app$ = new Subject();
  readonly closeMessages$ = new Subject();
  readonly toggleMessages$ = new Subject();
  readonly setAppName$ = new Subject();
  readonly contetChangedScroll$ = new Subject();
  readonly chatHeaderModeToggleMethod$ = new Subject();

  public loading$:Observable<any>;

  isEnableAppMessage$ = new BehaviorSubject<boolean>(false);
  isLiveInCos$ = new BehaviorSubject<boolean>(false);
  hideChatStream$: BehaviorSubject<boolean>;
  unreadMessages$ :Observable<any>;

}

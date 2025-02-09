import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject, ReplaySubject } from 'rxjs';

import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';


export type CallbackFunc = (success: { flow: FlowInterface, openNextStep: boolean } | false) => void;

export interface TriggerDataInterface {
  flowId: string;
  callback: CallbackFunc;
}

// TODO: Move to @pe/checkout/utils once translations are merged
@Injectable({
  providedIn: 'root',
})
export class SaveProgressHelperService implements OnDestroy {

  // Unfortunately we have to have this service to emit amount saving when save flow

  editting: {[key: string]: boolean} = {};
  trigger$: Subject<TriggerDataInterface> = new Subject();

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(private store: Store) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  triggerSaving(flowId: string, callback: CallbackFunc): void {
    if (this.editting[flowId]) {
      this.trigger$.next({ flowId, callback });
    } else {
      const flow = this.store.selectSnapshot(FlowState.flow);
      callback({ flow, openNextStep: false });
    }
  }
}

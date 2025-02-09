import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout/types';

import { FlowStorage } from './flow-storage';
import { SendToDeviceStorage, SendToDeviceStorageDataInterfaceSnakeCase } from './send-to-device-storage';

@Injectable({
  providedIn: 'root',
})
export class ExternalRedirectStorage {

  private wasRestored: {[key: string]: boolean} = {};

  private flowStorage = inject(FlowStorage);
  private sendToDeviceStorage = inject(SendToDeviceStorage);

  saveDataBeforeRedirect(flow: FlowInterface): Observable<void> { // For Paypal, Sofort, etc.
    const dump: any = this.flowStorage.getDump(flow.id);

    return this.sendToDeviceStorage.prapareAndSaveData(
      {
        flow,
        storage: dump,
        guest_token: flow.guestToken,
        // guest_token: this.token,
      },
      this.makeKey(flow.id)).pipe(map(() => null)
    );
  }

  restoreAndClearData(flowId: string): Observable<boolean> {
    return this.sendToDeviceStorage.getData(this.makeKey(flowId)).pipe(
      mergeMap((data) => {
        if (data?.storage) {
          this.flowStorage.restoreFromDump(flowId, data.storage);

          return this.sendToDeviceStorage.removeData(this.makeKey(flowId)).pipe(
            map(() => {
              this.wasRestored[flowId] = true;

              return true;
            })
          );
        }

        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  getDataByFlowId(flowId: string): Observable<SendToDeviceStorageDataInterfaceSnakeCase> {
    return this.sendToDeviceStorage.getData(this.makeKey(flowId));
  }

  isFlowWasRestored(flowId: string): boolean {
    return !!this.wasRestored[flowId];
  }

  private makeKey(flowId: string): string {
    return `flow_${flowId}`;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';

import { ChannelSwitchListInterface, CheckoutChannelSetTypeEnum } from '../../../interfaces';
import { StorageService } from '../../../services';

@Injectable()
export class BaseChannelsSwitchService {
  constructor(private storageService: StorageService){}
  
  private loadingSubject$ = new BehaviorSubject(false);

  public readonly isLoading$ = this.loadingSubject$.asObservable();

  fetchTerminalList(checkoutUuid: string, channelSetType: CheckoutChannelSetTypeEnum): Observable<ChannelSwitchListInterface[]> {
    return this.storageService.getCheckoutByIdOnce(checkoutUuid).pipe(
      switchMap(currentCheckout => this.storageService.getChannelSetsOnce().pipe(
          map(channelSets => channelSets.filter(channelSet => channelSet.type === channelSetType)
              .map(channelSet => ({
                id: channelSet.id,
                name: channelSet.name || '---',
                isToggled: true,
                active: channelSet.checkout === currentCheckout._id,
              }))
          ),
        )
      ),
    );
  }

  onChangeToggle(element: ChannelSwitchListInterface, checkoutUuid: string): Observable<void> {
    return this.storageService.getCheckoutByIdOnce(checkoutUuid).pipe(
      tap(() => {
        this.loadingSubject$.next(true);
      }),
      switchMap((currentCheckout) => {
        element.active = !element.active;

        return this.storageService.attachChannelSetToCheckout(element.id, element.active ? currentCheckout._id : null);
      }),
      catchError((_err) => {
        element.active = !element.active;

        return EMPTY;
      }),
      finalize(() => {
        this.loadingSubject$.next(false);
      }),
    );
  }
}

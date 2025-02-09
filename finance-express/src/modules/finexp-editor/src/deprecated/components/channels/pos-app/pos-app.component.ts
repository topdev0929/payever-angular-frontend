import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import {
  FinexpHeaderAbstractService,
  FinexpStorageAbstractService
} from '../../../services';
import { StorePosListInterface } from '../../../interfaces';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'pos-app',
  templateUrl: './pos-app.component.html'
})
export class PosAppComponent implements OnInit, OnDestroy {

  terminalList: StorePosListInterface[];

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(private activatedRoute: ActivatedRoute,
              private headerService: FinexpHeaderAbstractService,
              private router: Router,
              private storageService: FinexpStorageAbstractService) {}

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit() {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe(currentCheckout => {
      this.storageService.getChannelSetsOnce().subscribe(channelSets => {
        this.terminalList = [];
        channelSets.map(channelSet => {
          if (channelSet.type === 'pos') {
            this.terminalList.push({
              id: channelSet.id,
              name: channelSet.name || '---',
              isToggled: true,
              active: channelSet.checkout === currentCheckout._id
            });
          }
          return channelSet;
        });
        this.headerService.setShortHeader('channels.pos.title', () => this.goBack());
      });
    });
  }

  onChangeToggle(element: StorePosListInterface) {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe(currentCheckout => {
      element.active = !element.active;
      this.storageService.attachChannelSetToCheckout(element.id, element.active ? currentCheckout._id : null).subscribe();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  goBack() {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }
}

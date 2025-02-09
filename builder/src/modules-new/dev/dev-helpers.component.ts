import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { DevHelpersService } from './dev-helpers.service';

@Component({
  selector: 'dev-helpers', // tslint:disable-line
  templateUrl: './dev-helpers.component.html',
  styleUrls: ['./dev-helpers.component.scss'],
  providers: [DevHelpersService],
})
export class DevHelpersComponent extends AbstractComponent {
  modalShown = false;

  loginProcessing = false;

  accounts = [
    {
      user: 'testcases@payever.de',
      password: 'Payever123!',
    },
  ];
  accountSelected = 0;

  user = this.accounts[this.accountSelected].user;
  password = this.accounts[this.accountSelected].password;

  businesses: any[] = [];
  businessesLoading = false;
  businessSelected: any = null;

  type: 'shop' | 'pos' = 'shop';

  shopsLoading = false;
  shops: any[] = [];
  shopSelected: any = null;

  constructor(
    private devHelpers: DevHelpersService,
    private router: Router,
  ) {
    super();

    (window as any).devHelperCmp = this;

    this.router.events.pipe(
      filter((e: any) => e instanceof NavigationEnd),
      tap((e: NavigationEnd) => (e.urlAfterRedirects === '/') && (this.modalShown = true)),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onLoginSubmit(): void {
    this.loginProcessing = true;

    this.devHelpers
      .getAccessToken(this.user, this.password)
      .toPromise()
      .then(() => {
        this.businessesLoading = true;

        return this.devHelpers.getBusinesses().toPromise();
      })
      .then((businesses: any[]) => {
        this.businesses = businesses;
        if (this.businesses.length) {
          this.onBusinessSelected(this.businesses[0]._id);
        }

        this.loginProcessing = false;
        this.businessesLoading = false;
      })
      .catch((err: any) => {
        console.error(err);

        this.loginProcessing = false;
        this.businessesLoading = false;
      });
  }

  onBusinessSelected(event: any): void {
    this.businessSelected = event;
    this.shopsLoading = true;

    const requestPromise = this.type === 'shop'
      ? this.devHelpers
        .getShops(this.businessSelected)
        .toPromise()
      : this.devHelpers
        .getTerminals(this.businessSelected)
        .toPromise();

    requestPromise
      .then((shops: any[]) => {
        this.shopsLoading = false;
        this.shops = shops;

        if (this.shops.length) {
          this.onShopSelected(this.shops[0]._id);
        }
      });
  }

  onShopSelected(event: any): void {
    this.shopSelected = event;
  }

  onAccountSelected(accountIndex: number): void {
    this.accountSelected = accountIndex;
    const account = this.accounts[this.accountSelected];
    this.user = account.user;
    this.password = account.password;
  }

  onNavigate(section: any): void {
    this.router
      .navigate(['business', this.businessSelected, 'builder', this.type, this.shopSelected, 'builder', section])
      .then(() => {
        this.modalShown = false;
      });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'KeyL' && event.ctrlKey && event.shiftKey) {
      this.modalShown = !this.modalShown;
    }
  }
}

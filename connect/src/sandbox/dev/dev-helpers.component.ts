import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DevHelpersService } from './dev-helpers.service';

@Component({
  selector: 'dev-helpers', // tslint:disable-line
  templateUrl: './dev-helpers.component.html',
  styleUrls: ['./dev-helpers.component.scss'],
  providers: [
    DevHelpersService,
  ]
})
export class DevHelpersComponent {
  modalShown = false;

  loginProcessing = false;
  user = 'testcases@payever.de';
  password = 'Payever123!';

  businesses: any[] = [];
  businessesLoading = false;
  businessSelected: any = null;

  constructor(
    private devHelpers: DevHelpersService,
    private router: Router,
  ) {
    (window as any).devHelpersCmp = this;
  }

  onLoginSubmit() {
    this.loginProcessing = true;

    this.devHelpers.getAccessToken(this.user, this.password)
      .toPromise()
      .then(() => {
        this.businessesLoading = true;
        return this.devHelpers.getBusinesses().toPromise();
      })
      .then((businesses) => {
        this.businesses = businesses;
        if (this.businesses.length) {
          this.onBusinessSelected(this.businesses[0]._id);
        }

        this.loginProcessing = false;
        this.businessesLoading = false;
      })
      .catch((err) => {
        console.error(err);

        this.loginProcessing = false;
        this.businessesLoading = false;
      });
  }

  onBusinessSelected(event: any) {
    this.businessSelected = event;
  }

  onNavigate() {
    this.router.navigate([
      'business',
      this.businessSelected,
      'connect'
    ]).then(() => {
      this.modalShown = false;
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'KeyL' && event.ctrlKey && event.shiftKey) {
      this.modalShown = !this.modalShown;
    }
  }
}

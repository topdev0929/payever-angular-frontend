import { AfterViewInit, Component, ElementRef, HostBinding, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';

@Component({
  selector: 'token-dev',
  templateUrl: 'token-dev.component.html',
})
export class TokenDevComponent implements AfterViewInit {
  activated = false;
  @ViewChild('inputToken', { static: true }) inputToken: ElementRef;
  @ViewChild('inputRefreshToken', { static: true }) inputRefreshToken: ElementRef;
  @ViewChild('inputRoute', { static: true }) inputRoute: ElementRef;

  @HostBinding('class.devContainer') devContainer = true;

  constructor(private authService: PeAuthService,
              private router: Router) {}

  ngAfterViewInit(): void {
    if (location.pathname.indexOf('products') !== -1) {
      this.dispose();
    }
  }

  stubNavigate(): void {
    this.activated = true;
    this.router.navigate([`business/stub`]);
  }

  go(): void {
    this.authService.setToken(this.inputToken.nativeElement.value).pipe(take(1)).subscribe(() => {
      this.authService.setRefreshToken(this.inputRefreshToken.nativeElement.value).pipe(take(1)).subscribe(() => {
        this.router.navigateByUrl(this.inputRoute.nativeElement.value).then(() => {
          this.dispose();
        },
          () => alert('route is wrong'));
      });
    });
  }

  dispose(): void {
    document.getElementsByClassName('devContainer')[0].remove();
  }
}

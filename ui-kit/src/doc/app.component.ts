import { Component, ViewContainerRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'doc-app',
  templateUrl: 'app.component.html'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  routeFragmentSubscription: Subscription;
  isMenuOpen: boolean;

  constructor(private route: ActivatedRoute, public viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit(): void {
    this.routeFragmentSubscription = this.route.fragment
      .subscribe(fragment => {
        if (fragment) {
          setTimeout(() => {
            const element: Element = document.getElementById(fragment);
            if (element) {
              element.scrollIntoView();
            }
          }, 50);
        }
      });
  }

  ngOnDestroy(): void {
    this.routeFragmentSubscription.unsubscribe();
  }

  onMenuToggle(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}

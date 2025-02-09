import { Component, ViewContainerRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'components',
  templateUrl: 'components.component.html'
})
export class ComponentsComponent implements AfterViewInit, OnDestroy {
  routeFragmentSubscription: Subscription;
  isMenuOpen: boolean;

  constructor(private route: ActivatedRoute, public viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit(): void {
    this.routeFragmentSubscription = this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const element: Element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView();
          }
        }, 50);
      }
    });

    $('.docsidebar .has-children > a').on('click', function() {
      $(this).parent().toggleClass('collapsed');
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

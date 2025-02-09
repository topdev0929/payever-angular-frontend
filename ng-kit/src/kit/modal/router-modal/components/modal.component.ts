import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Params, Router, UrlSegment } from '@angular/router';
import { Subscription } from 'rxjs';
import { compact, map } from 'lodash-es';

import { DefaultRouterModalConfig, RouterModalConfig, RouterModalService } from '../router-modal.service';

declare const $: any;

@Component({
  selector: 'pe-router-modal',
  templateUrl: 'modal.component.html'
})
export class ModalComponent implements OnInit, OnDestroy {
  config: RouterModalConfig;
  newModeActivate: boolean = false;

  @ViewChild('modal', { static: true }) modal: ElementRef;

  private $modal: any;
  private subs: Subscription[];

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private routerModalService: RouterModalService) {
    this.config = DefaultRouterModalConfig;
    this.subs = [];
  }

  ngOnInit(): void {
    this.subs.push(this.routerModalService.config$.subscribe((config: RouterModalConfig): void => {
      // setup config
      if (config.newModeActivate) {
        this.newModeActivate = true;
      }
      this.config = Object.assign({}, DefaultRouterModalConfig, config);
      this.$modal = $(this.modal.nativeElement);
      this.$modal.modal({
        show: true,
        keyboard: this.config.closeOnEsc,
        backdrop: this.config.closeOnBackdrop
      });
      this.$modal.on('hidden.bs.modal', () => this.destroy());
      // handle close
      this.subs.push(this.routerModalService.close$.subscribe(this.close.bind(this)));
    }));
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription): void => sub.unsubscribe());
  }

  /**
   * Click Submit button event.
   */
  onClickSubmit(): void {
    this.submit();
  }

  /**
   * Click Cancel button event.
   */
  onClickCancel(): void {
    this.cancel();
  }

  /**
   * Click Additional button event.
   */
  onClickAdditional(): void {
    this.additional();
  }

  /**
   * Send submit event.
   */
  private submit(): void {
    this.routerModalService.submit();
  }

  /**
   * Send cancel event.
   */
  private cancel(): void {
    this.routerModalService.cancel();
    this.close();
  }

  /**
   * Send additional event.
   */
  private additional(): void {
    this.routerModalService.additional();
  }

  /**
   * Close outlet.
   */
  private close(): void {
    this.$modal.modal('hide');
  };

  /**
   * Destroy modal.
   */
  private destroy(): void {
    const snapshot: ActivatedRouteSnapshot = this.activatedRoute.snapshot;
    const queryParams: Params = snapshot.queryParams;
    const fragment: string = snapshot.fragment;
    let url: string[] = [];
    map(snapshot.parent.pathFromRoot, 'url').forEach(
      (urlSegments: UrlSegment[]) => urlSegments.forEach((urlSegment: UrlSegment) => url.push(urlSegment.path))
    );
    url = compact(url);
    if ( url.length ) {
      url[0] = `/${url[0]}`;
    }
    else {
      url.push('/');
    }
    this.router.navigate(url, {
      queryParams: queryParams,
      fragment: fragment
    });
  }
}

import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WindowService } from '@pe/ng-kit/modules/window';
import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { HeaderService } from '../../../../shared/services';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-details-container',
  templateUrl: 'details-container.component.html',
  styleUrls: ['details-container.component.scss']
})
export class DetailsContainerComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  isMobile: boolean;
  loading: boolean;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private stylesApplied: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private headerService: HeaderService,
    private platformHeaderService: PlatformHeaderService,
    private router: Router,
    private windowService: WindowService
  ) { }

  ngOnInit(): void {
    this.windowService.isMobile$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((isMobile: boolean) => this.isMobile = isMobile);
    this.detailService.loading$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((loading: boolean) => {
        this.loading = loading;
      });
    this.headerService.setShortHeader('details.title', () => this.backToTransactionsList());
  }

  ngOnDestroy(): void {
    this.headerService.destroyShortHeader();
  }

  ngAfterViewInit(): void {
    const content: Element
      = document.querySelector('.mat-card-content-scroll-container.data-grid-scroll-container');

    if (content) {
      content['style'].overflowY = 'hidden';
      content['style'].paddingRight = 0;
      content['style'].width = '100%';
    }

  }

  ngAfterViewChecked(): void {
    if (this.stylesApplied) {
      return;
    }
    const expansionPanels: NodeListOf<Element> = document.querySelectorAll('.mat-expansion-panel-body');

    if (expansionPanels && expansionPanels.length) {
      expansionPanels.forEach(panel => {
        panel['style'].borderRadius = '12px';
      });
      this.stylesApplied = true;
    }
  }

  backToTransactionsList(): void {
    // For some reason '../' doesn't work anymore. Maybe because from now it redirects to different module. Angular's magic
    const pathParts: string[] = window.location.pathname.split('/');
    pathParts.pop();
    this.router.navigate([pathParts.join('/')], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' });
  }

}

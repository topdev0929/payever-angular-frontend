import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EllipsisDirective } from 'ngx-ellipsis';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { IntegrationCategory, IntegrationInfoWithStatusInterface } from '../../interfaces';
import { IntegrationsStateService, NavigationService } from '../../services';

@Component({
  selector: 'integration-card',
  templateUrl: './integration-card.component.html',
  styleUrls: ['./integration-card.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class IntegrationCardComponent implements AfterViewInit {

  @ViewChild(EllipsisDirective) ellipsisRef: EllipsisDirective;
  @ViewChild('image') image: ElementRef<HTMLImageElement>;

  @Input() integration: IntegrationInfoWithStatusInterface;
  @Input() gridAnimationProgress$: Observable<any>;
  @Input() onScroll$: Observable<Event>;
  @Input() selected: boolean;
  @Output() toggleCardSelection = new EventEmitter();
  @Output() saveReturn: EventEmitter<IntegrationCategory> = new EventEmitter();

  imageSrc = '';

  constructor(
    private integrationsStateService: IntegrationsStateService,
    private navigationService: NavigationService,
    private translateService: TranslateService,
    private router: Router,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  get name(): string {
    return this.integration?.name;
  }

  get installed(): boolean {
    return this.integration?._status?.installed;
  }


  ngAfterViewInit(): void {
    // To avoid multiple calculations during resize animation
    if (this.gridAnimationProgress$) {
      this.gridAnimationProgress$
        .pipe(
          distinctUntilChanged(),
          filter(val => !!val),
          debounceTime(200),
          takeUntil(this.destroy$),
        )
        .subscribe(() => this.ellipsisRef?.applyEllipsis());
    }
  }

  navigateToIntegrationFullPage(): void {
    const businessId = this.integrationsStateService.getBusinessId();
    if (this.installed) {
      this.navigationService.saveReturn(`business/${businessId}/connect`);
      this.router.navigate([
        `business/${businessId}/connect/${this.integration.category}/configure/${this.integration.name}`]);
    } else {
      this.navigationService.saveReturn(this.router.url);
      this.router.navigate([
        `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/fullpage`]);
    }
  }

  openLink(event: Event, url: string) {
    event.stopPropagation();
    window.open(this.translateService.hasTranslation(url) ? this.translateService.translate(url) : url, '_blank');
  }

  onInViewportChange({ target, visible }: { target: Element; visible: boolean }) {
    const backgroundUrl = 'url(' + this.integration?.installationOptions?.links[0]?.url + ')';
    if (visible && this.imageSrc !== backgroundUrl) {
      this.imageSrc = backgroundUrl;
    }
  }
}

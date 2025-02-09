import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-timeline-section',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TimelineSectionComponent extends BaseSectionClass {
  history$ = this.detailService.timelineItems$;

  constructor(
    protected injector: Injector,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface
  ) {
    super(injector);

    this.matIconRegistry.addSvgIcon(
      `success`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/timeline-status/success.svg`),
    );

    this.matIconRegistry.addSvgIcon(
      `failed`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/timeline-status/failed.svg`),
    );
  }
}

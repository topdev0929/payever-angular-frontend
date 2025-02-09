import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/index';

import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n-core';
import { PeDestroyService } from '@pe/common';

import { PeMessageApiService } from '../../../services';

import { PeMessageChannelFormComponent } from '../message-channel-form';

@Component({
  selector: 'pe-message-channel-root',
  templateUrl: './message-channel-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageChannelRootComponent implements OnInit {

  theme = 'dark';

  constructor(
    private peMessageApiService: PeMessageApiService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyed$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    this.openChannelFormOverlay();
  }

  private openChannelFormOverlay(): void {
    const onCloseSubject$ = new Subject<any>();
    const peOverlayConfig: PeOverlayConfig = {
      backdropClick: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      },
      data: {
        onCloseSubject$,
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.channel.overlay.title'),
        theme: this.theme,
      },
      panelClass: 'pe-message-channel-form-overlay',
      component: PeMessageChannelFormComponent,
    };

    this.peMessageApiService.getUserList().pipe(
      take(1),
      tap(() => {
        this.peOverlayWidgetService.open(peOverlayConfig);
      }),
    ).subscribe();

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap(() => {
        this.peMessageApiService.getAppsChannelList().pipe(
          takeUntil(this.destroyed$),
        ).subscribe();
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

}

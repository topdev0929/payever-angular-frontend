import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { takeUntil, tap } from 'rxjs/operators';

import { AppType, APP_TYPE, EnvService, MessageBus, PeDestroyService, PreloaderState } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';

import { PeSocialHeaderService } from '../services';

@Component({
  selector: 'pe-social-root',
  templateUrl: './social-root.component.html',
  styleUrls: ['./social-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class CosSocialRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: { };

  private readonly confirmationListener$ = this.messageBus
    .listen('open-confirm')
    .pipe(
      tap((headings: Headings) => {
        this.confirmationService.show(headings, false);
      }));

  constructor(
    @Optional() @Inject(APP_TYPE) private appType: AppType,
    private confirmationService: ConfirmScreenService,
    private envService: EnvService,
    private messageBus: MessageBus,
    private readonly destroy$: PeDestroyService,

    private peSocialHeaderService: PeSocialHeaderService,
  ) { }

  public get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  ngOnDestroy(): void {
    this.peSocialHeaderService.destroy();
  }

  ngOnInit(): void {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
    ]);

    this.peSocialHeaderService.initialize();
    this.confirmationListener$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}

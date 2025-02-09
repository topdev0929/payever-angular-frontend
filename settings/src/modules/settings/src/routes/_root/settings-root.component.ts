import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, filter, pluck, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, MessageBus, TreeFilterNode } from '@pe/common';

import { MatDialog } from '@angular/material/dialog';
import { TranslationLoaderService } from '@pe/i18n';
import { WelcomeDialogComponent } from '../..';
import { AbstractComponent } from '../../components/abstract';
import {
  GridExpandAnimation,
  MobileSidebarAnimation,
  SETTINGS_NAVIGATION,
  settingsBusinessIdRouteParam,
  SidebarAnimation,
  SidebarAnimationProgress,
  SidebarAnimationStates,
} from '../../misc/constants';
import { WelcomeDialogDataInterface } from '../../misc/interfaces/welcome-dialog-data.interface';
import { BusinessEnvService, SettingsSidebarService } from '../../services';

@Component({
  selector: 'peb-settings',
  templateUrl: './settings-root.component.html',
  styleUrls: ['./settings-root.component.scss'],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSettingsComponent extends AbstractComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  isSidebarClosed = window.innerWidth <= 720;
  loaded = false;
  theme = this.envService.businessData$?.themeSettings?.theme ? AppThemeEnum[this.envService.businessData$.themeSettings.theme]
    : AppThemeEnum.default;

  private readonly gridAnimationStateStream$ = new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);
  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();

  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();
  readonly gridAnimationProgress$: Observable<SidebarAnimationProgress> = this.gridAnimationProgressStream$.asObservable();
  SidebarAnimationProgress = SidebarAnimationProgress;

  treeData: TreeFilterNode[] = SETTINGS_NAVIGATION;

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  constructor(
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private envService: BusinessEnvService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private sidebarService: SettingsSidebarService,
  ) {
    super();
    this.messageBus.listen(`settings.toggle.sidebar`).pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroyed$),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  toggleSidebar(close?: boolean) {
    this.isSidebarClosed = close ? close : !this.isSidebarClosed;
    this.cdr.markForCheck();
  }

  navigateTolLink(id) {
    this.messageBus.emit(`${this.entityName}.navigate.${id}`, this.envService.businessId);
    if (window.innerWidth <= 720) {
      this.toggleSidebar(true);
    }
  }

  ngOnInit() {
    this.initTranslations();

    if (this.envService.businessId && !this.route.snapshot.children.length) {
      this.messageBus.emit(`${this.entityName}.navigate.dashboard`, this.envService.businessId);
    }

    this.messageBus.listen('change.theme').pipe(takeUntil(this.destroyed$)).subscribe((theme: string) => {
      this.theme = AppThemeEnum[theme];
      this.cdr.detectChanges();
    });

    this.route.data.pipe(
      pluck('microId'),
      filter(shouldDisplay => !!shouldDisplay),
      takeUntil(this.destroyed$),
    ).subscribe( microId => this.showWelcomeDialog(microId));

    this.sidebarService.getHeaderStateObservable$()
     .pipe(takeUntil(this.destroyed$))
     .subscribe(() => this.toggleSidebar());
  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['settings-app']).pipe(
      catchError(err => {
        console.warn('Cant load translations for domains', ['settings-app'], err);

        return of(true);
      }),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private showWelcomeDialog(appId: string) {
    const data: WelcomeDialogDataInterface = {
      business: this.route.snapshot.params[settingsBusinessIdRouteParam],
      micro: appId,
    };

    this.dialog.open(WelcomeDialogComponent, {
      panelClass: 'settings-dialog',
      data,
    });
  }
}

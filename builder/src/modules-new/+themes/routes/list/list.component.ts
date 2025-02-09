import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent, LoaderManagerService } from '@pe/ng-kit/modules/common';
import { PeStepperService, PeWelcomeStep, PeWelcomeStepAction, PeWelcomeStepperAction, PeWelcomeStepperEvent } from '@pe/stepper';
import { ThemesService } from '../../services/themes.service';
import { ListAllComponent } from '../list-all/list-all.component';
import { ListUsersComponent } from '../list-users/list-users.component';

export const PRELOAD_HEIGHT = 0.15; // Start to loading themes before user goes to bottom of the page.

@Component({
  selector: 'pe-builder-themes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent extends AbstractComponent implements AfterViewInit, OnInit {

  @ViewChild('themes', { static: false }) themesElement: ElementRef;
  activeType = '';

  PeWelcomeStepAction = PeWelcomeStepAction;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly loaderManagerService: LoaderManagerService,
    private readonly themesService: ThemesService,
    private readonly router: Router,
    public peStepperService: PeStepperService,
  ) {
    super();

    (window as any).router = router;
    (window as any).themeRoute = activatedRoute;
    (window as any).BFstepper = peStepperService;

    router.events
      .pipe(
        filter(
          evt =>
            evt instanceof ActivationEnd &&
            [ListUsersComponent, ListAllComponent].includes(evt.snapshot.component as any),
        ),
        tap((evt: ActivationEnd) => (this.activeType = evt.snapshot.routeConfig.path)),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnInit(): void {
    if (
      this.peStepperService.currentStep &&
      (
        this.peStepperService.currentStep.action === PeWelcomeStepAction.CreateShop ||
        this.peStepperService.currentStep.action === PeWelcomeStepAction.ChooseTheme
      )
    ) {
      this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, true);
      this.peStepperService.dispatch(PeWelcomeStepperAction.EnableContinue, false);

      if (this.peStepperService.currentStep.action === PeWelcomeStepAction.CreateShop) {
        this.peStepperService.dispatch(PeWelcomeStepperAction.NextStepLoaded, this.peStepperService.currentStep);
      }
    }
  }

  ngAfterViewInit(): void {
    this.loaderManagerService.showGlobalLoader(false);
    this.loaderManagerService.showAppLoader(false);
    this.themesService.loadNextThemesPage$.next(true);

    fromEvent(this.themesElement.nativeElement, 'scroll').pipe(
      map(_ => {
        const contentEl: HTMLElement = this.themesElement.nativeElement;

        return contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - (contentEl.scrollHeight * PRELOAD_HEIGHT);
      }),
      distinctUntilChanged(),
      tap(isScrollBottom => {
        this.themesService.loadNextThemesPage$.next(isScrollBottom);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onNavigate(event: MatButtonToggleChange): void {
    this.router
      .navigate([event.value], {
        relativeTo: this.activatedRoute,
      })
      .then(/* do nothing */)
      .catch();
  }
}

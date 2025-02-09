import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { Component, Input, Inject } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { RouteDataInterface } from '../route-data.interface';
import { LocationService } from '../../../location';

@Component({
  selector: 'pe-layout-header',
  styleUrls: ['layout-header.component.scss'],
  templateUrl: './layout-header.component.html'
})
export class LayoutHeaderComponent {

  @Input() defaultBackLinkHref: string = '/';
  @Input() defaultBackLinkTitle: string = '';
  @Input() notTransparent: boolean;
  @Input() showBackButton: boolean = true;
  @Input() fullWidth: boolean = true;

  backButtonClicked$: Subject<void> = new Subject<void>();
  // we made router.navigate relative to activated route from this flow
  private deepestActivatedRoute$: BehaviorSubject<ActivatedRoute> = new BehaviorSubject<ActivatedRoute>(null);
  private destroyed$: Subject<void> = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private windowLocation: LocationService
  ) {
  }

  get backButtonTitle$(): Observable<string> {
    return this.deepestActivatedRoute$.pipe(map((route: ActivatedRoute) => {
      let backTitle: string = this.defaultBackLinkTitle;
      if (route) {
        backTitle = this.getRouteData(route).backTitle || backTitle;
      }
      return backTitle;
    }));
  }

  ngOnInit(): void {
    this.emitLastChildRoute();

    this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      takeUntil(this.destroyed$), )
      .subscribe(() => {
        this.emitLastChildRoute();
      });

    this.backButtonClicked$
      .pipe(
        switchMap(() => this.deepestActivatedRoute$.pipe(take(1))),
        takeUntil(this.destroyed$)
      )
      .subscribe((route: ActivatedRoute) => {
        const routeData: RouteDataInterface = this.getRouteData(route);
        if (routeData && routeData.backRoute) {
          this.router.navigate(routeData.backRoute, {relativeTo: route});
        } else if (this.defaultBackLinkHref) {
          this.windowLocation.href = this.defaultBackLinkHref;
        } else {
          this.router.navigate(['../'], {relativeTo: route});
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private emitLastChildRoute(): void {
    this.deepestActivatedRoute$.next(this.getLastChildRoute());
  }

  private getRouteData(activatedRoute: ActivatedRoute): RouteDataInterface {
    return {
      backRoute: (activatedRoute.snapshot.data as RouteDataInterface).backRoute,
      backTitle: (activatedRoute.snapshot.data as RouteDataInterface).backTitle
    };
  }

  private getLastChildRoute(): ActivatedRoute {
    let lastChildRoute: ActivatedRoute;
    this.activatedRoute.root.children.some(function findLastChild(route: ActivatedRoute): boolean {
      lastChildRoute = route;
      if (route.children.length) {
        return route.children.some(findLastChild);
      }
      return true;
    });
    return lastChildRoute;
  }
}

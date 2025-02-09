import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, pairwise, switchMap, take, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { PartnerService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { OnboardingService, OnboardingDTO, PluginOnboardingService } from '@pe/shared/onboarding';
import { PeUser, UserState, BusinessState, LoadBusinesses, ResetBusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';

import { PeProfileCardInterface, ProfileCardType } from '../interfaces/profile-card.interface';

enum LoginStep {
  Business = 'business',
}

@Component({
  selector: 'pe-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
  ],
})
export class PeSwitcherComponent implements OnInit, AfterViewInit, OnDestroy {
  @Select(UserState.user) user$: Observable<PeUser>;
  @Select(BusinessState.businesses) businesses$: Observable<{ businesses: BusinessInterface[]; total: number }>;
  @Select(BusinessState.loading) isloading$: Observable<boolean>;
  @ViewChild(CdkVirtualScrollViewport) scroller: CdkVirtualScrollViewport;

  profileCardType: typeof ProfileCardType = ProfileCardType;

  isLoading = false;
  isListLoading = false;
  reloadedBusinesses = false;
  showBusinessLoader$: Subject<boolean> = new Subject();
  showPersonalLoader = false;
  businessWithLoader: string;
  backgroundUrl = '';
  total = 0;
  currentLength = 0;
  maxBusinessPageSize = 500;
  businessWithLogoErrors: string[] = [];

  businessesInfo$: Observable<{ businesses: BusinessInterface[]; total: number }>;
  searchStringSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  pluginActions$ = new Subject<string>();

  profileCardConfig$: Observable<PeProfileCardInterface>;

  loginStep = LoginStep;
  currentStep = LoginStep.Business;
  pluginLoginMethods = {};
  partnerData: OnboardingDTO;

  private plugin: string;

  constructor(
    private authService: PeAuthService,
    private mediaUrlPipe: MediaUrlPipe,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private wallpaperService: WallpaperService,
    private ref: ChangeDetectorRef,
    private store: Store,
    private zone: NgZone,
    private partnerService: PartnerService,
    private onboardingService: OnboardingService,
    private pluginOnboardingService: PluginOnboardingService,
    private readonly destroy$: PeDestroyService,
    private location: Location,
  ) {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

    this.plugin = this.route.snapshot.queryParams['plugin'];
    this.wallpaperService.backgroundImage = this.wallpaperService.defaultBlurredBackgroundImage;

    this.isloading$
      .pipe(
        tap(data => this.isListLoading = data),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.businessesInfo$ = combineLatest([
      combineLatest([this.businesses$, this.searchStringSubject$]).pipe(
        filter(([data, searchStringData]) => !!data.businesses.length),
        map(([data, searchString]) => {
          this.total = Math.max(this.total, data.total);

          return {
            businesses: data.businesses.slice(1).filter((business: BusinessInterface) =>
              (!searchString || business?.name?.toLowerCase()?.includes(searchString.toLowerCase()))
              && business._id !== this.authService.refreshLoginData.activeBusiness._id),
            total: data.total,
          };
        }),
        filter(Boolean),
      ),
      this.user$.pipe(filter(Boolean)),
    ]).pipe(
      switchMap(([businessInfo, userData]: [{ businesses: BusinessInterface[]; total: number }, PeUser]) => {
        if (userData.hasUnfinishedBusinessRegistration && !businessInfo.total) {
          this.router.navigate([`/registration`], queryParams);

          return of(null);
        }

        if (businessInfo.total === 1) {
          const business = JSON.parse(localStorage.getItem('pe_active_business'));

          if (invitationRedirectUrl) {
            this.router.navigate([invitationRedirectUrl, businessInfo?.businesses[0]._id]);
          } else if (this.plugin) {
            this.pluginActions$.next(business._id);

            return of(null);
          } else {
            this.router.navigate([`business/${business._id}/info/overview`]);
          }

          return of(null);
        }
        if (businessInfo?.businesses?.length) {
          const businesses = businessInfo.businesses.map<BusinessInterface>((business: BusinessInterface) => {
            return {
              ...business,
              name: business.name,
              _id: business._id,
              logo: business.logo ? this.mediaUrlPipe.transform(business.logo, 'images') : null,
              uuid: business._id, // it is need for profile switcher
            };
          });

          return of({
            businesses,
            total: businessInfo.total - 1,
          });
        }
      }),
      takeUntil(this.destroy$),
      catchError((err) => {
        return this.router.navigate(['/login'], queryParams);
      }),
    ) as Observable<{ businesses: BusinessInterface[]; total: number }>;

    this.profileCardConfig$ = this.businessesInfo$.pipe(
      takeUntil(this.destroy$),
      filter((businessInfo: any) => businessInfo?.total || this.reloadedBusinesses),
      withLatestFrom(this.businesses$),
      map(([businessInfo, userActiveBusinesses]) => {
        let activeBusiness: BusinessInterface = this.authService.refreshLoginData.activeBusiness;
        const existInUserBusinessList = userActiveBusinesses.businesses.slice(1).some((item: BusinessInterface) => item._id === activeBusiness._id);
        if (!activeBusiness || !existInUserBusinessList) {
          activeBusiness = businessInfo.businesses[0];
        }
        this.authService.refreshLoginData = { activeBusiness };

        // if business count == 1 we have to pass only one image in array
        const images: string[] =
          [activeBusiness.logo ? this.mediaUrlPipe.transform(activeBusiness.logo, 'images') : ''];

        return {
          ...activeBusiness,
          type: ProfileCardType.Business,
          cardTitle: this.translateService.translate('switcher.business_type').toLocaleUpperCase(),
          placeholderTitle: activeBusiness.name,
          cardButtonText:
            this.total > 1
              ? `${this.translateService.translate('switcher.all')} ${this.total}`
              : activeBusiness.name,
          images: images,
        };
      }),
    );

    this.pluginActions$.pipe(
      take(1),
      tap(() => this.isLoading = true),
      switchMap((businessId: string) => this.pluginActions(LoginStep.Business, businessId).pipe(take(1))),
    ).subscribe();
  }

  get isMobile(): boolean {
    return window.innerWidth <= 520;
  }

  ngAfterViewInit() {
    if (this.scroller) {
      this.scroller
        .elementScrolled()
        .pipe(
          map(() => this.scroller.measureScrollOffset('bottom')),
          pairwise(),
          filter(([y1, y2]) => y2 < y1 && y2 < 140),
          throttleTime(200),
        )
        .subscribe(() => {
          this.zone.run(() => {
            this.onLoadBusinesses();
          });
        });
    }
  }

  initPluginActions(): void {
    this.partnerData = this.partnerService.getPartnerFromLocalStorage();

    if (this.partnerData) {
      Object.values(this.loginStep).forEach((value) => {
        this.pluginLoginMethods[value] =
          this.partnerData.afterLogin.filter(val => val.registerSteps.find(step => step === value));
      });
    }
  }

  ngOnInit(): void {
    let lastBg = this.wallpaperService.defaultBlurredBackgroundImage;

    if (this.plugin) {
      this.initPluginActions();
    }

    if (!lastBg?.length) {
      lastBg = localStorage.getItem('lastBusinessWallpaper');
    }

    this.backgroundUrl = `url(${lastBg})`;

    this.authService.getUserData();
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onProfileCardClick(): void {
    this.profileCardConfig$.pipe(take(1), switchMap((activeBusiness) => {
      this.showBusinessLoader$.next(true);

      if (this.plugin) {
        return this.pluginActions(LoginStep.Business, activeBusiness._id);
      }

      const re = /:businessId/g;

      this.onboardingService.partnerAfterActions.next({ id: activeBusiness?._id, re });

      this.authService.refreshLoginData = {
        activeBusiness: activeBusiness,
      };

      const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
      if (invitationRedirectUrl) {
        this.router.navigate([invitationRedirectUrl, activeBusiness._id]);
      } else {
        this.router.navigate(['/business', activeBusiness._id]);
      }

      return of([]);
    })).subscribe();
  }

  openPersonalProfile(): void {
    this.showPersonalLoader = true;
    this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
  }

  onProfileFromListClick(business: BusinessInterface): void {
    this.businessWithLoader = business._id;
    const re = /:businessId/g;

    if (this.plugin) {
      this.pluginActions$.next(business._id);

      return;
    }

    this.onboardingService.partnerAfterActions.next({ id: business._id, re });
    this.authService.refreshLoginData = {
      activeBusiness: business,
    };

    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, business._id]);
    } else {
      this.router.navigate(['/business', business._id]);
    }
  }

  onLoadBusinesses() {
    if (this.isListLoading) {
      return;
    }
    this.currentLength += 20;
    if (this.currentLength >= this.total) {
      return;
    }
    const currentPage = Math.trunc(this.currentLength / 20);
    const nextPage = currentPage + 1;
    this.store.dispatch(new LoadBusinesses('false', nextPage.toString(), '20'));
  }

  backClick() {
    this.location.back();
  }

  filterBusiness(event) {
    if (this.reloadedBusinesses === false) {
      this.store.dispatch(new ResetBusinessState());
      this.store.dispatch(new LoadBusinesses(
        'false',
        '1',
        Math.min(this.total, this.maxBusinessPageSize).toString()));
      this.reloadedBusinesses = true;
    }
    this.searchStringSubject$.next(event);
  }

  private pluginActions(step, id): Observable<unknown> {
    if (this.pluginLoginMethods[step]) {
      return this.pluginOnboardingService.runAfterPluginActions(this.pluginLoginMethods[step], {
        businessId: id,
        integration: this.plugin,
      });
    }
    this.onboardingService.actionController.next();

    return of(null);
  }

  hasBusinessLogoErrors(businessId: string): boolean {
    return this.businessWithLogoErrors.includes(businessId);
  }

}

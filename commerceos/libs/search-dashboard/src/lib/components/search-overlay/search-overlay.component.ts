import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Select } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  flatMap,
  map,
  startWith,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { ApiService, SpotlightResp } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';
import {
  EnvironmentConfigInterface,
  EnvService,
  openOverlayAnimation,
  PE_ENV,
  PeDestroyService,
  SearchGroup,
  SearchGroupItems,
  SpotlightSearch,
} from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';
import { BusinessState } from '@pe/user';

import { SearchBoxService } from '../../services/search-box.service';
import { SearchOverlayService } from '../../services/search-overlay.service';

const MESSAGE_1 = {
  title: 'search_overlay.message.search.title',
  subtitle: 'search_overlay.message.search.subtitle',
};

const MESSAGE_2 = {
  title: 'search_overlay.message.no-results.title',
  subtitle: 'search_overlay.message.no-results.subtitle',
};

interface LoginAsUserParamsInterface {
  isByEmail: boolean;
  email: string;
  name: string;
  id: string;
  logo?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  forceRedirectToPersonal?: boolean;
};

@Component({
  selector: 'pe-search-overlay',
  templateUrl: 'search-overlay.component.html',
  styleUrls: ['./search-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [openOverlayAnimation],
  providers: [
    PeDestroyService,
  ],
})
export class SearchOverlayComponent implements OnInit, AfterViewInit {
  @ViewChild('input') input: ElementRef;
  @HostBinding('@overlayAnimation') animatedMenu = true;

  isAdmin: boolean;
  isAdmin$: Observable<boolean> = this.authService.onChange$.pipe(
    startWith(null),
    map(() => this.authService.isAdmin()),
  );

  isByEmail: boolean;

  searchString$ = new Subject<string>();

  hasValue: boolean;
  emptySearch = true;
  _searchText = '';
  get searchText() {
    return this._searchText;
  }

  set searchText(input: string) {
    this._searchText = input;
    this.searchString$.next(input);
  }

  groups: SpotlightSearch[] = [];
  adminGroups: SearchGroup[] = [];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  firstLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoading = false;
  @Select(DockerState.dockerItems) apps$: Observable<DockerItemInterface[]>;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  installedApps$: Observable<DockerItemInterface[]>;
  navigationStarted: boolean;
  spinerStrokeWidth = 2;
  spinerDiameter = 18;

  message: {
    title: string;
    subtitle: string;
  } = MESSAGE_1;

  constructor(
    private authService: PeAuthService,
    protected apiService: ApiService,
    protected searchBoxService: SearchBoxService,
    private searchOverlayService: SearchOverlayService,
    private httpClient: HttpClient,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private envService: EnvService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    this.router.events.pipe(
      tap((event: RouterEvent) => {
        if (event instanceof NavigationEnd && this.navigationStarted) {
          this.close();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit(): void {
    combineLatest([
      this.isLoading$,
      this.firstLoading$,
    ]).pipe(
      tap(([isLoading, firstLoading]: boolean[]) => {
        this.isLoading = isLoading && firstLoading;
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.searchString$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((searchString: string) => {
          if (!searchString) {
            this.message = MESSAGE_1;
            this.emptySearch = true;
            this.hasValue = false;
            this.groups = [];
            this.adminGroups = [];
            this.isLoading$.next(false);

            return false;
          }

          return true;
        }),
        tap((searchString: string) => {
          this.emptySearch = false;
          this.isLoading$.next(true);
        }),
        flatMap((searchString: string) => {
          if (this.isAdmin) {
            this.hasValue = !!searchString;
            this.isByEmail = this.isEmail(searchString);

            return this.apiService.getAdminSpotlightSearch(searchString);
          }
          const businessUuid: string = this.businessData._id;

          return this.apiService.getSpotlightSearch(searchString, this.searchBoxService.MaxResults, businessUuid);
        }),
        map((resp: SpotlightResp) => {
          if (this.isLoading$.value) {
            this.groups = this.searchBoxService.getGroups(
              resp.result,
              this.isAdmin ? this.envService.businessId : null,
            );
            if (!this.groups.length) {
              this.message = MESSAGE_2;
            }
            this.isLoading$.next(false);
            this.hasValue = !!this.groups.length;
          } else {
            this.groups = [];
          }
          if (this.firstLoading$.value && !!this.groups.length) {
            this.firstLoading$.next(false);
          }
          if (!this.groups.length && !this.firstLoading$.value) {
            this.firstLoading$.next(true);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.searchText = this.searchOverlayService.searchText;
    this.installedApps$ = combineLatest([
      this.apps$,
      this.isAdmin$.pipe(
        take(1),
        tap((value: boolean) => {
          this.isAdmin = value;
        }),
      ),
    ]).pipe(
      map(
        ([apps, isAdmin]: any[]) => {
          return apps.filter((app: DockerItemInterface) => isAdmin || app.installed)
            .sort((app1: DockerItemInterface, app2: DockerItemInterface) => {
              return app1.title > app2.title ? 1 : -1;
            });
        },
      ),
    );
    this.changeDetectorRef.detectChanges();
  }

  getBusinessesAsAdmin(ids: number[], query: string): Observable<BusinessInterface[]> {
    return this.apiService.getBusinessesListWithParams(ids, query).pipe(map(res => res));
  }

  isEmail(value: string): boolean {
    const regexp = /\S+@\S+\.\S+/;

    return regexp.test(value);
  }

  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }

  close() {
    this.searchOverlayService.close();
  }

  openApp(app) {
    this.router.navigate(['business', this.businessData._id, app.code]).then(() => this.close());
  }

  async onClickResult(item: SearchGroupItems): Promise<void> {
    if (this.isAdmin && item.app === 'users') {
      const params = {
        isByEmail: false,
        forceRedirectToPersonal: true,
        email: item.email,
        name: item.title,
        id: item._id,
      };
      this.loginAsUser(params, item.serviceEntityId);

      return;
    }

    if (item?.url) {
      this.navigationStarted = true;
      (item as any).navigating = true;
      this.changeDetectorRef.detectChanges();
      await this.router.navigate(item.url);
    } else {
      console.error('Cant find URL in search item!', item);
    }
  }

  onClickResultAsAdmin(item: SearchGroupItems): void {
    if (!this.isAdmin) {
      this.onClickResult(item);

      return;
    }
    const envMedia: string = this.env.custom.storage;

    if (item.email) { // email available only with admin params
      const params = {
        isByEmail: true, // this.isByEmail, should go directly to applications
        email: item.email,
        logo: item.imageIconSrc?.replace(`${envMedia}/images/`, ''),
        name: item.title,
        city: item?.city,
        firstName: item.firstName,
        lastName: item.lastName,
        id: item._id,
      };
      this.loginAsUser(params, item['userId']);
    } else {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate('search_overlay.errors.wrong_email'),
        duration: 2500,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
  }

  private loginAsUser(params: LoginAsUserParamsInterface, userId: string) {
    const url = `${this.env.backend.auth}/api/login-as-user`;
    this.httpClient.post<void>(url, { email: params.email, id: userId }).pipe(
      tap((tokens: any) => {
        const queryParams = {
          ...params,
          ...tokens,
        };
        this.router.navigate(['login/as-user'], { queryParams }).then(() => {
          this.searchOverlayService.close();
        });
      })
    ).subscribe();
  }
}

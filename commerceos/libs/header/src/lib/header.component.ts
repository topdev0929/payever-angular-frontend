import {
  Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy, ChangeDetectorRef,
  ViewEncapsulation,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil, tap, delay } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { BusinessInterface } from '@pe/business';
import { TranslateService } from "@pe/i18n";
import { LocaleService } from '@pe/i18n-core';
import { MediaUrlPipe } from '@pe/media';
import { PeMessageOverlayService } from '@pe/message';
import { MessageService } from '@pe/message/shared';
import { DropdownComponent, NotificationService, NotificationsResponseInterface } from '@pe/notifications';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SearchOverlayService, SearchOverlayComponent } from '@pe/search-dashboard';
import { AddBusinessOverlayComponent, ModuleLoaderService } from '@pe/shared/header';
import { RegistrationService } from '@pe/shared/registration';
import { BusinessState, LoadBusinesses } from '@pe/user';

@Component({
  selector: 'pe-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() menuItems = [
    {
      translateTitle: 'header.menu.switch_business',
      icon: '#icon-switch-block-16',
      onClick: () => {},
    },
    {
      translateTitle: 'header.menu.personal_information',
      icon: '#icon-person-20',
      onClick: () => {},
    },
  ];

  @Select(BusinessState.businesses) businesses$: Observable<{ businesses: BusinessInterface[]; total: number }>;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  notifications$: Observable<NotificationsResponseInterface> = this.notificationService.notofications;
  destroy$ = new Subject<void>();
  loading$ = this.messageService.loading$;

  totalBusinesses: number;
  unreadMessages: string;
  showIconOfMessageApp = false;

  contactHref= "mailto:support@payever.de?subject=payever CommerceOS/Contact";
  helpHref: string;

  messageOverlayService: PeMessageOverlayService;

  @ViewChild(DropdownComponent) dropdown: DropdownComponent;

  constructor(
    public envService: CosEnvService,
    private apiService: ApiService,
    private authService: PeAuthService,
    private peOverayWidgetService: PeOverlayWidgetService,
    private notificationService: NotificationService,
    private search: SearchOverlayService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private mediaUrlPipe: MediaUrlPipe,
    private messageService: MessageService,
    private localeService: LocaleService,
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private moduleLoaderService: ModuleLoaderService,
    private renderer: Renderer2,
    private translateService: TranslateService,
  ) {
    this.store.dispatch(new LoadBusinesses());

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'close-menu-16',
    ]);
  }

  ngOnInit() {
    this.messageService.isEnableAppMessage$.pipe(
      delay(100),
      tap(() => {
        this.localeService.currentLocale$
          .pipe(
            tap((locale) => {
              this.helpHref =
                locale.code === 'de' ? 'https://support.payever.org/hc/de' : 'https://support.payever.org/hc/en-us';
            }),
            takeUntil(this.destroy$),
          )
          .subscribe();
      })
    ).subscribe();

    if (!this.registrationService.justRegistered && !this.route.snapshot.queryParams?.fromTODO) {
      this.messageService.closeMessages$.next(null);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuItems']) {
      this.menuItems = changes['menuItems'].currentValue;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  getBusinessImagePath(image: string): string {
    return image ? image?.split('/').length > 1 ? image : this.mediaUrlPipe.transform(image, 'images') : null;
  }

  logout() {
    this.apiService.logout().subscribe();
    this.authService.logout().subscribe();
    this.messageService.closeMessages$.next(null);
  }

  openSearch() {
    this.search.open(SearchOverlayComponent);
  }

  ngAfterViewInit() {
    const wrapperElement = document.querySelector('.widgets-dashboard-wrapper');
    // Subscribe to menuOpened event
    this.menuTrigger.menuOpened.subscribe(() => {

      this.renderer.addClass(wrapperElement, 'menu-opened');
      // Do something when the menu is opened
    });

    // Subscribe to menuClosed event
    this.menuTrigger.menuClosed.subscribe(() => {
      this.renderer.removeClass(wrapperElement, 'menu-opened');
      // Do something when the menu is closed
    });
  }

  toggleNotifications() {
    if (!this.dropdown.open) {
      this.dropdown.show();
    } else {
      this.dropdown.hide();
    }
  }

  navigateToExternal(link: string) {
    window.open(link);
  }

  toggleMessages() {
    if (this.messageOverlayService) {
      this.messageOverlayService.toggleMessages();

      return;
    }
    import('@pe/message').then(({ PeMessageOverlayService }) => {
      this.moduleLoaderService.loadModule().then((moduleRef) => {
        this.messageOverlayService = moduleRef.injector.get(PeMessageOverlayService);
        this.messageOverlayService.toggleMessages();
      });
    });
  }

  addBusiness() {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: AddBusinessOverlayComponent,
      data: {
        businessRegistrationData: null,
      },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate('header.add-business.title'),
        backBtnTitle: this.translateService.translate('header.add-business.back'),
        backBtnCallback: () => {
          this.peOverayWidgetService.close();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {},
        doneBtnTitle: this.translateService.translate('header.add-business.done'),
        doneBtnCallback: () => {},
      },
    };

    this.apiService
      .getBusinessRegistrationData()
      .pipe(
        take(1),
        tap((data) => {
          config.data.businessRegistrationData = data;
          this.peOverayWidgetService.open(config);
        }),
      )
      .subscribe();
  }

  navigateToSettings() {
    this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`);
  }
}

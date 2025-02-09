import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { TranslateService } from '@pe/i18n';

import {
  PeSettingsConnectExistingComponent,
  PeSettingsCreateAppComponent,
  PeSettingsCustomerPrivacyComponent,
  PeSettingsFacebookPixelComponent,
  PeSettingsGoogleAnalyticsComponent,
  PeSettingsPasswordProtectionComponent,
  PeSettingsPayeverDomainComponent,
  PeSettingsPersonalDomainComponent,
  PeSettingsSocialImageComponent,
  PeSettingsSpamProtectionComponent,
} from '../../components';

@Component({
  selector: 'peb-blog-settings',
  templateUrl: './blog-settings.component.html',
  styleUrls: ['./blog-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ],
})
export class PebBlogSettingsComponent implements OnInit {
  openedBlog;
  blogList;
  isLive: boolean;
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default
  onSavedSubject$ = new BehaviorSubject(null)

  components = {
    payeverDomain: {
      component: PeSettingsPayeverDomainComponent,
      header: 'blog-app.settings.payever_domain',
    },
    connectExisting: {
      component: PeSettingsConnectExistingComponent,
      header: 'blog-app.settings.connect_existing',
    },
    createApp: {
      component: PeSettingsCreateAppComponent,
      header: 'blog-app.actions.create_new',
    },
    cusomerPrivacy: {
      component: PeSettingsCustomerPrivacyComponent,
      header: 'blog-app.settings.customer_privacy',
    },
    facebookPixel: {
      component: PeSettingsFacebookPixelComponent,
      header: 'blog-app.settings.facebook_pixel',
    },
    googleAnalytics: {
      component: PeSettingsGoogleAnalyticsComponent,
      header: 'blog-app.settings.google_analytics',
    },
    passwordProtection: {
      component: PeSettingsPasswordProtectionComponent,
      header: 'blog-app.settings.password_protection',
    },
    personalDomain: {
      component: PeSettingsPersonalDomainComponent,
      header: 'blog-app.settings.personal_domain',
    },
    socialImage: {
      component: PeSettingsSocialImageComponent,
      header: 'blog-app.settings.social_image',
    },
    spamProtection: {
      component: PeSettingsSpamProtectionComponent,
      header: 'blog-app.settings.spam_protection',
    },
  }

  constructor(
    private blogApi: PebBlogsApi,
    private route: ActivatedRoute,
    private overlay: PeOverlayWidgetService,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    private envService: PebEnvService,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
  ) {
  }

  toggleShopLive(e) {
    this.blogApi.patchIsLive(this.openedBlog._id, e).subscribe((data: any) => {
      this.openedBlog.accessConfig = data;
      this.isLive = data.isLive
    })
    this.cdr.markForCheck()
  }



  ngOnInit() {
    this.getBlogList().subscribe()
    this.onSavedSubject$.asObservable().pipe(
      tap(data => {
        if (data?.updateBlogList) {
          this.getBlogList().subscribe()
        }
        if (data?.openBlog) {
          this.route.snapshot.parent.parent.data = { ...this.route.snapshot?.parent?.parent?.data, blog: data.blog };
        }
        if (data?.connectExisting) {
          this.openOverlay(this.components.connectExisting)
        }
      }),
      takeUntil(this.destroy$),

    ).subscribe()
  }

  onShopClick(blog: any) {
    if (blog.isDefault) {
      return;
    }
    this.blogApi.markBlogAsDefault(blog._id).pipe(switchMap(data => this.getBlogList())).subscribe(() => {

    })
  }

  getBlogList() {
    return this.blogApi.getBlogsList().pipe(

      tap(blogs => {
        console.log('getBlogsList ', {blogs});
        this.blogList = blogs;
        blogs.map(blog => {
          if (blog._id === this.route.snapshot.params.blogId) {
            this.openedBlog = blog;
            this.isLive = blog?.accessConfig?.isLive;
          }
        })
        this.cdr.markForCheck()
      }),

    )

  }

  openOverlay(item, itemData?: any) {
    const overlayData = itemData ? itemData : this.openedBlog;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: item.component,
      data: { ...overlayData, onSved$: this.onSavedSubject$ },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate(item.header),
        backBtnTitle: this.translateService.translate('blog-app.actions.cancel'),
        theme: this.theme,
        backBtnCallback: () => { this.overlay.close() },
        cancelBtnTitle: '',
        cancelBtnCallback: () => { },
        doneBtnTitle: this.translateService.translate('blog-app.actions.done'),
        doneBtnCallback: () => { },
      }
    }

    console.log('openOverlay ', config);

    this.overlay.open(
      config,
    )
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';
import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { loadStyles, removeStyle } from '@pe/lazy-styles-loader';
import { PeUser, UserState, BusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';

import { notificationsTransition } from '../../animations/dashboard.animation';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'user-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [notificationsTransition],
  providers: [PeDestroyService],
})
export class DashboardComponent implements OnInit {

  @Select(UserState.user) user$: Observable<PeUser>;
  @Select(UserState.loading) loading$: Observable<boolean>;
  @Select(BusinessState.businesses) businesses$: Observable<{businesses: BusinessInterface[], total: number}>;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  headerMenuItems = [];

  constructor(
    private wallpaperService: WallpaperService,
    private authService: PeAuthService,
    private router: Router,
    private readonly destroyed$: PeDestroyService,
    ) {
      this.wallpaperService.backgroundImage = this.businessData?.currentWallpaper?.wallpaper
      || this.wallpaperService.defaultBackgroundImage;

      if (this.businessData?.themeSettings?.theme !== AppThemeEnum.dark) {
        loadStyles([{ name: this.businessData?.themeSettings?.theme, id:"pe-theme" }]);
      }
      else {
        removeStyle("pe-theme");
      }
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'set',
      'dashboard',
      'notification',
    ]);

    const userData = this.authService.getUserData();
    this.authService.refreshLoginData = {
      activeBusiness: this.authService.refreshLoginData.activeBusiness,
      email: userData?.email,
    };

    this.businesses$.pipe(
      takeUntil(this.destroyed$),
      tap((businesses) => {
        this.reloadMenuItems(businesses.total);
      })
    ).subscribe();
  }

  reloadMenuItems(totalBusinesses: number) {
    this.headerMenuItems = [
      {
        translateTitle: 'header.menu.switch_business',
        icon: '#icon-switch-block-16',
        onClick: () => {
          this.router.navigate(['switcher']);
        },
        show: totalBusinesses > 1,
      },
      {
        translateTitle: 'header.menu.personal_information',
        icon: '#icon-person-20',
        onClick: () => {
          this.router.navigate([`personal/${this.authService.getUserData().uuid}`]);
        },
        show: true,
      },
    ];
  }
}

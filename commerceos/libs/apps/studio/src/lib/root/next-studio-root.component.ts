import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  Optional,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface } from '@pe/business';
import { AppType, APP_TYPE, PreloaderState } from '@pe/common';
import { BusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';

import { PeStudioHeaderService } from '../studio-header.service';

@Component({
  selector: 'cos-next-studio-root',
  templateUrl: './next-studio-root.component.html',
  styleUrls: ['./next-studio-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextStudioRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(PreloaderState.loading) loading: {};


  constructor(
    public router: Router,
    private studioHeaderService: PeStudioHeaderService,
    private wallpaperService: WallpaperService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) { }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  ngOnInit() {
    this.wallpaperService.showDashboardBackground(false);

    this.studioHeaderService.initialize();
  }

  ngOnDestroy() {
    this.studioHeaderService.destroy();
  }
}

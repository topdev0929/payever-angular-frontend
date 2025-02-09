import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { entryLogo } from '@pe/base';
import { PeDestroyService } from '@pe/common';
import { WallpaperService } from '@pe/wallpaper';
import { WindowService } from '@pe/window';


@Component({
  selector: 'entry-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class LayoutComponent implements OnInit{

  @Input() hideLogo: boolean;
  @Input() hideLanguageSwitcher: boolean = false;

  isMobile$: Observable<boolean>;

  logo: any;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('entryLogo')
  set Color(logo) {
    this.logo = logo || entryLogo;
  };

  readonly allowedLocales = ['en', 'de', 'no', 'da', 'sv', 'nl'];

  isEntryLayoutRegisterClass: boolean;

  constructor(
    private router: Router,
    private wallpaperService:WallpaperService,
    private windowService: WindowService,
    private readonly destroy$: PeDestroyService,
  ) { }


  ngOnInit(): void {
    this.isMobile$ = this.windowService.width$.pipe(
      map(width => width <= 480),
      takeUntil(this.destroy$)
    );
  }

  onLocaleChanged(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([this.router.url]).then(() => {
      this.wallpaperService.animation = false;
      this.router.onSameUrlNavigation = 'ignore';
    });
  }


}

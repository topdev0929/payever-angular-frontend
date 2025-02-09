import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { PartnerService } from '@pe/api';
import { BrowserDetectService } from '@pe/browser';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';

@Injectable({
  providedIn: 'root',
})
export class WallpaperService {
  private _backgroundImage$: BehaviorSubject<string> = new BehaviorSubject(this._defaultBackgroundImage);
  private _blurredBackgroundImage$: BehaviorSubject<string> = new BehaviorSubject(this._defaultBlurredBackgroundImage);
  private _showDashboardBackground$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  backgroundImage$: Observable<string> = this._backgroundImage$.asObservable();
  lastDashboardBackground = '';
  animation = true;

  constructor(
    private mediaUrlPipe: MediaUrlPipe,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private browser: BrowserDetectService,
    private partnerService: PartnerService,
  ) {}

  get pathParts(): string[] {
    return String(window.location.pathname).split('/').filter(d => d !== '');
  }

  get _defaultBackgroundImage(): string {
    if (this.isRegistrationOrLogin) {
      const partnerData = this.partnerService.getPartnerFromLocalStorage();

      if (partnerData) {
        return !this.browser.isSafari
          ? partnerData.wallpaperUrl.replace('.jpg', '.webp')
          : partnerData.wallpaperUrl;
      }

      const industry = this.getUrlPart();
      if (industry) {
        return `${this.env.custom.cdn}/images/commerceos-industry-background-${industry}.${this.browser.isSafari ? 'jpg' : 'webp'}`;
      } else {
        return `${this.env.custom.cdn}/images/commerceos-background.${this.browser.isSafari ? 'jpg' : 'webp'}`;
      }
    }

    return `${this.env.custom.cdn}/images/commerceos-background.${this.browser.isSafari ? 'jpg' : 'webp'}`;
  }

  get _defaultBlurredBackgroundImage(): string {
    const industry = this.getUrlPart();
    if (this.isRegistrationOrLogin && industry) {
      return `${this.env.custom.cdn}/images/commerceos-industry-background-${industry}-blurred.${this.browser.isSafari ? 'jpg' : 'webp'}`;
    }

    return `${this.env.custom.cdn}/images/commerceos-background-blurred.${this.browser.isSafari ? 'jpg' : 'webp'}`;
  }

  set backgroundImage(image: string) {
    this._backgroundImage$.next(image);
  }

  get backgroundImage(): string {
    return this._backgroundImage$.value;
  }

  get defaultBackgroundImage(): string {
    return this._defaultBackgroundImage;
  }

  get blurredBackgroundImage(): string {
    return this._blurredBackgroundImage$.value;
  }

  get defaultBlurredBackgroundImage(): string {
    return this._defaultBlurredBackgroundImage;
  }

  showDashboardBackground(showDashboardBackground: boolean): void {
    this._showDashboardBackground$.next(showDashboardBackground);
  }

  setBackgrounds(wallpaper: string) {
    this._backgroundImage$.next(this.mediaUrlPipe.transform(`${wallpaper}`, MediaContainerType.Wallpapers));
    this._blurredBackgroundImage$.next(
      this.mediaUrlPipe.transform(`${wallpaper}-blurred`, MediaContainerType.Wallpapers),
    );
    this.saveCurrentDefaultBackground();
    this.lastDashboardBackground = this._blurredBackgroundImage$.getValue();
    localStorage.setItem('lastBusinessWallpaper', this._blurredBackgroundImage$.getValue());
  }

  resetBackgroundsToDefault(noBackgroundBlur: boolean = false): void {
    this._backgroundImage$.next(this._defaultBackgroundImage);
    if (noBackgroundBlur) {
      this._blurredBackgroundImage$.next(this._defaultBackgroundImage);
    } else {
      this._blurredBackgroundImage$.next(this._defaultBlurredBackgroundImage);
    }
  }

  saveCurrentDefaultBackground(): void {
    localStorage.setItem('pe-default-background', this._defaultBackgroundImage);
    localStorage.setItem('pe-default-background-blurred', this._defaultBlurredBackgroundImage);
  }

  private get isRegistrationOrLogin(): boolean {
    return this.pathParts[0] === 'registration' || this.pathParts[0] === 'login';
  }

  private getUrlPart(): string {
    const ignore = ['personal', 'business', 'refresh', 'employees'];

    return this.pathParts[1] && ignore.indexOf(this.pathParts[1]) < 0
      ? this.pathParts[1]
      : null;
  }
}

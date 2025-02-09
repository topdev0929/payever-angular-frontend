import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PeThemeEnum } from './theme.interface';
import cssVars from 'css-vars-ponyfill';
import { PeThemePalette } from './theme.constants';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: "platform"
})
export class ThemeSwitcherService {
  // tslint:disable-next-line:member-ordering
  defaultTheme: PeThemeEnum = PeThemeEnum.DARK;
  themeSubject$: BehaviorSubject<PeThemeEnum> = new BehaviorSubject(this.defaultTheme);
  theme$: Observable<PeThemeEnum> = this.themeSubject$.asObservable().pipe(distinctUntilChanged());
  autoMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  autoTheme$: BehaviorSubject<PeThemeEnum> = new BehaviorSubject<PeThemeEnum>(null);

  
  

  constructor() {
    this.autoMode$.pipe(
      switchMap(auto => auto ? this.autoTheme$ : this.theme$),
      filter(theme => !!theme),
      tap((theme: PeThemeEnum) => this.changeTheme(theme))
    ).subscribe();
  }

  set theme(theme: PeThemeEnum) {
    this.themeSubject$.next(theme);
  }
  
  get theme(): PeThemeEnum {
    return this.themeSubject$.value;
  }

  resetThemeToDefault(): void {
    this.themeSubject$.next(this.defaultTheme);
  }

  changeTheme(theme: PeThemeEnum) {
    const business = JSON.parse(localStorage.getItem('pe_active_business'));
    if (business && business.themeSettings && business.themeSettings.theme) {
      business.themeSettings.theme = theme;
      localStorage.setItem('pe_active_business', JSON.stringify(business));
    }
    if (theme) {
      this.themeSubject$.next(theme);
      this.applyTheme(theme, []);
    }
    else {
      this.resetThemeToDefault();
    }
  }

  applyTheme(theme: PeThemeEnum, elementSelectors: string | string[]): void {
    // Apply theme via CSS3 vars
    const palette = PeThemePalette[theme];
    this.updateThemePalette(palette);
  }
  /**
   * Update the css variables value of document root as per palette
   * @param palette the palette containing colors and its values
   *
   */
  private updateThemePalette(palette: {
    [key: string]: string;
  }): void {
    cssVars({
      variables: palette
    });
  }
}



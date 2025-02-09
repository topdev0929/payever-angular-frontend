import { AfterViewInit, Input, Injector, ChangeDetectorRef, HostBinding, Output, EventEmitter, ElementRef, Directive } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, timer } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { forEach } from 'lodash-es';

import { AbstractComponent } from '../../common';
import { LocaleConstantsService, TranslationLoaderService } from '../../i18n';
import {
  ENV_CONFIG_TOKEN, EnviromentConfigModuleConfigInterface, EnvironmentConfigLoaderService, EnvironmentConfigService
} from '../../environment-config';
import { TimestampEvent } from './timestamp-event';

@Directive()
export abstract class CustomElementWrapperComponent extends AbstractComponent implements AfterViewInit {

  @Output('ready') ready$: EventEmitter<boolean> = new EventEmitter();
  isReady$: Observable<boolean>;
  isReadyConfigLocales$: Observable<boolean>;

  protected customIsReadySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  // '_' is to avoid name conflicts in inherited classes
  private _isReadySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _isTranslationsLoaded: boolean = false;
  private _isEnvConfigLoaded: boolean = false;
  private _isIconsLoaded: boolean = false;

  private _translationLoaderService: TranslationLoaderService = this._injector.get(TranslationLoaderService);
  private _configService: EnvironmentConfigService = this._injector.get(EnvironmentConfigService);
  private _envConfigLoaderService: EnvironmentConfigLoaderService = this._injector.get(EnvironmentConfigLoaderService);
  private _localeConstantsService: LocaleConstantsService = this._injector.get(LocaleConstantsService);
  private _cdr: ChangeDetectorRef = null;
  private _elementRef: ElementRef = this._injector.get(ElementRef);

  @HostBinding('class.pe-bootstrap') peBootstrapClass: boolean = true;

  @Input('absoluterooturl') set absoluteRootUrl(url: string) {
    const moduleConfig: EnviromentConfigModuleConfigInterface = this._injector.get(ENV_CONFIG_TOKEN);
    if (moduleConfig) {
      moduleConfig.absoluteRootUrl = url;
    }
  }

  constructor(private _injector: Injector) {
    super();
    this.isReady$ = combineLatest([this._isReadySubject.asObservable(), this.customIsReadySubject]).pipe(map(d => d[0] && d[1]));
    this.isReadyConfigLocales$ = this._isReadySubject.asObservable();
    this.isReady$.pipe(takeUntil(this.destroyed$)).subscribe(isReady => this.ready$.next(isReady));
  }

  ngAfterViewInit(): void {
    // timer here is to avoid ExpressionChangedAfterItHasBeenCheckedError
    timer(1).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.loadCustomElementConfigAndTranslationsAndIcons();
      this._cdr = this._injector.get(ChangeDetectorRef); // We init here to not trigger detect changes before view initialed.
    });
  }

  updateCustomElementView(): void {
    if (this._cdr && !this._cdr['destroyed']) {
      this._cdr.detectChanges();
    }
  }

  parseInputObject(data: string): any {
    let result: any = data;
    try {
      result = JSON.parse(data);
    } catch (e) {}
    return result;
  }

  parseInputBoolean(data: any): boolean {
    return data === true || data === 'true' ? true :
      data === false || data === 'false' ? false :
        false;
  }

  parseInputNumber(data: any): number {
    return parseFloat(data);
  }

  parseInputString(data: string): string {
    let result: string = data;
    try {
      result = JSON.parse(data);
    } catch (e) {}
    return String(result);
  }

  parseInputEventEmit<T>(data: string): T {
    const result: T = this.parseInputObject(data);
    if (result) {
      delete (result as any as TimestampEvent)._timestamp;
    }
    return result;
  }

  checkInputEventEmit(data: any): boolean {
    const event: TimestampEvent = this.parseInputObject(data);
    return event && !!event._timestamp;
  }

  protected abstract getI18nDomains(): string[];

  protected abstract getIconsPack(): string[];

  protected isCustomElementReady(): boolean {
    // for children usage
    return true;
  }

  protected onCustomElementReady(): void {
    // for children usage
  }

  protected getLang(): string {
    return this._localeConstantsService.getLang();
  }

  protected isCustomElementTranslationsLoaded(): boolean {
    return this._isTranslationsLoaded;
  }

  protected isCustomElementEnvConfigLoaded(): boolean {
    return this._isEnvConfigLoaded;
  }

  protected triggerCustomElementReadyCheck(): void {
    if (this.isCustomElementTranslationsLoaded() && this.isCustomElementEnvConfigLoaded() && this.isCustomElementReady()) {
      this.onCustomElementReady();
      this._isReadySubject.next(true);
    }
  }

  protected loadCustomElementConfigAndTranslationsAndIcons(): void {
    if (!this._isEnvConfigLoaded) {
      this._envConfigLoaderService.loadEnvironmentConfig().subscribe(config => {
        this._isEnvConfigLoaded = true;
        this.triggerCustomElementReadyCheck();

        if (!this._isIconsLoaded && this._configService.getConfig()) {
          this.loadIconsPack(this._configService.getConfig().custom.cdn);
          this._isIconsLoaded = true;
        }
      });
    }
    if (!this._isTranslationsLoaded) {
      this._translationLoaderService.loadTranslations([...this.getI18nDomains(), 'ng-kit-ng-kit']).subscribe(() => {
        this._isTranslationsLoaded = true;
        this.triggerCustomElementReadyCheck();
      });
    }
  }

  private checkIsIconLoaded(iconName: string): boolean {
    return document.querySelector(`svg[data-id="icons-${iconName}"]`) !== null;
  }

  private shadowRoot(): HTMLElement {
    return this._elementRef && this._elementRef.nativeElement && this._elementRef.nativeElement.shadowRoot ?
      this._elementRef.nativeElement.shadowRoot : null;
  }

  private loadIconsPack(cdnBase: string) {
    const payeverStatic = (window as any).PayeverStatic;
    if (payeverStatic) {
      if (this.shadowRoot()) {
        // For ViewEncapsulation.ShadowDom case
        payeverStatic.IconLoader.loadIcons(this.getIconsPack(), null, this.shadowRoot());
      } else {
        payeverStatic.IconLoader.loadIcons(this.getIconsPack());
      }
    } else {
      // TODO Not sure that we need following code, can be removed
      forEach(this.getIconsPack(), iconPack => {
        if (!this.checkIsIconLoaded(iconPack)) {
          const now = new Date();
          const hash = window['pe_static_storage_hash'] || (window as any).PE_HASH || `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;
          const scriptEl: HTMLScriptElement = document.createElement('script');
          scriptEl.src = `${cdnBase}/icons-js/pe-icons-${iconPack}.js?${hash}`;
          (document.head as HTMLScriptElement).appendChild(scriptEl);
        }
      });
    }
  }
}

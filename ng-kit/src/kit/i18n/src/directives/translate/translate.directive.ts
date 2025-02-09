import { Directive, ElementRef, Input, AfterViewInit, Renderer2, AfterViewChecked } from '@angular/core';

import { TranslateService } from '../../services';

@Directive({
  selector: '[translate]'
})
export class TranslateDirective implements AfterViewInit, AfterViewChecked {

  @Input('translate')
  set translate(params: any) {
    this.params = params;
    if (this.inited) {
      this.updateTranslation();
    }
  }

  @Input('translationScope')
  set translationScope(translationScope: string) {
    this._translationScope = translationScope;
    if (this.inited) {
      this.updateTranslation();
    }
  }
  get translationScope(): string {
    return this._translationScope;
  }
  private _translationScope: string;
  private _cachedTranslation: string;

  private element: HTMLElement;
  private params: any;
  private key: string;
  private inited: boolean = false;

  private readonly attributeKey: string = 'pe-i18n-key';

  constructor(
    protected elRef: ElementRef,
    protected translateService: TranslateService,
    protected renderer: Renderer2,
  ) { }

  ngAfterViewInit(): void {
    this.element = this.elRef.nativeElement;
    this.key = this.element.textContent.trim();
    this.inited = true;
  }

  ngAfterViewChecked(): void {
    this.updateTranslation();
  }

  private updateTranslation(): void {
    const translated: string = this.translateService.translate(this.prefixy(this.key), this.params);
    if (translated !== this._cachedTranslation) {
      this.renderer.setProperty(this.elRef.nativeElement, 'innerHTML', translated);
      this.renderer.setAttribute(this.element, this.attributeKey, this.key);
      this._cachedTranslation = translated;
    }
  }

  private prefixy(value: string): string {
    return this._translationScope ? `${this._translationScope}.${value}` : value;
  }
}

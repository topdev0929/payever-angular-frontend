// tslint:disable max-classes-per-file

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { nonRecompilableTestModuleHelper } from '../../../../test';
import { TranslateDirective } from './translate.directive';
import { TranslateStubService, TranslateService } from '../../services';
import { TranslationTemplateArgs } from '../../interfaces';

const translatedClassName: string = 'translated';
const translationKey1: string = '[translation_key_1]';
const translationKey2: string = '[translation_key_2]';
const translationKey3: string = '[translation_key_3]';
@Component({
  template: `
    <span *ngIf="showPlainTranslation" class="${translatedClassName}" translate>${translationKey1}</span>
    <span *ngIf="showUntrimmedTranslation" class="${translatedClassName}" translate>

      ${translationKey2}

    </span>
    <span *ngIf="showTranslationWithArgs" class="${translatedClassName}" [translate]="translationArgs">
      ${translationKey3}
    </span>
    <span *ngIf="showRenderableTranslation" class="${translatedClassName}" translate>
      {{ translationKey }}
    </span>
    <span *ngIf="showTranslationScope" translate class="${translatedClassName}" [translationScope]="translationScope">{{ translationKey }}</span>
  `
})
class HostComponent {
  showPlainTranslation: boolean = false;
  showUntrimmedTranslation: boolean = false;
  showTranslationWithArgs: boolean = false;
  translationArgs: TranslationTemplateArgs;
  showRenderableTranslation: boolean = false;
  translationKey: string;
  showTranslationScope: boolean = false;
  translationScope: string;
}

describe('TranslateDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;
  let translateService: TranslateStubService;

  const attributeKey: string = 'pe-i18n-key';
  const salt: string = '[translations_salt]';
  const translatedSpanSelector: string = '.translated';

  nonRecompilableTestModuleHelper({
    declarations: [
      TranslateDirective,
      HostComponent
    ],
    providers: [
      { provide: TranslateService, useClass: TranslateStubService }
    ]
  });

  beforeEach(() => {
    translateService = TestBed.get(TranslateService);
    // NOTE: We need for salt to ensure that translation service has been called
    translateService.useSalt = salt;
    translateService.useArgs = true;
    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should translate inner text as key after initialization and set relative attribute', () => {
    component.showPlainTranslation = true;
    fixture.detectChanges();
    const translated: DebugElement = fixture.debugElement.query(By.css(translatedSpanSelector));
    expect(translated).toBeTruthy();
    expect((translated.nativeElement as HTMLSpanElement).textContent).toBe(`${salt}_${translationKey1}`);
    expect(translationKey1).toBeTruthy(); // self-test
    expect((translated.nativeElement as HTMLSpanElement).getAttribute(attributeKey)).toBe(translationKey1);
  });

  it('should trim translation key', () => {
    component.showUntrimmedTranslation = true;
    fixture.detectChanges();
    const translated: DebugElement = fixture.debugElement.query(By.css(translatedSpanSelector));
    expect(translated).toBeTruthy();
    expect((translated.nativeElement as HTMLSpanElement).textContent).toBe(`${salt}_${translationKey2}`);
  });

  it('should accept @Input() translate', () => {
    let translated: DebugElement;

    component.showTranslationWithArgs = true;
    const translationArgs: TranslationTemplateArgs = {
      value: ''
    };
    component.translationArgs = translationArgs;
    fixture.detectChanges();
    translated = fixture.debugElement.query(By.css(translatedSpanSelector));
    expect(translated).toBeTruthy();
    expect((translated.nativeElement as HTMLSpanElement).textContent).toContain(translationKey3);
    expect((translated.nativeElement as HTMLSpanElement).textContent).toBe(
      translateService.translate(translationKey3, translationArgs)
    );

    const newTranslationArgs: TranslationTemplateArgs = {
      foo: 'bar'
    };
    component.translationArgs = newTranslationArgs;
    fixture.detectChanges();
    translated = fixture.debugElement.query(By.css(translatedSpanSelector));
    expect(translated).toBeTruthy();
    expect((translated.nativeElement as HTMLSpanElement).textContent).toContain(translationKey3);
    expect((translated.nativeElement as HTMLSpanElement).textContent).toBe(
      translateService.translate(translationKey3, newTranslationArgs)
    );

    const nullTranslationArgs: TranslationTemplateArgs = null;
    component.translationArgs = nullTranslationArgs;
    fixture.detectChanges();
    translated = fixture.debugElement.query(By.css(translatedSpanSelector));
    expect(translated).toBeTruthy();
    expect((translated.nativeElement as HTMLSpanElement).textContent).toContain(translationKey3);
    expect((translated.nativeElement as HTMLSpanElement).textContent).toBe(
      translateService.translate(translationKey3, nullTranslationArgs)
    );
  });

  it('should prefixy with @Input() translationScope', () => {
    const translationKey: string = 'custom.translation.key.234234';
    const translationScope: string = 'custom.translation.scope';

    translateService.useSalt = '';
    component.translationKey = translationKey;
    component.translationScope = translationScope;
    component.showTranslationScope = true;
    fixture.detectChanges();

    const translated: DebugElement = fixture.debugElement.query(By.css(translatedSpanSelector));
    expect(translated).toBeTruthy();
    expect((translated.nativeElement as HTMLSpanElement).textContent).toBe(
      `${translationScope}.${translationKey}`
    );
  });

  it('should translate renderable value', () => {
    const tranlationKey: string = '[custom_translation_key]';
    component.translationKey = tranlationKey;
    component.showRenderableTranslation = true;
    fixture.detectChanges();
    const translated: DebugElement = fixture.debugElement.query(By.css(translatedSpanSelector));
    expect(translated).toBeTruthy();
    expect((translated.nativeElement as HTMLSpanElement).textContent).toBe(`${salt}_${tranlationKey}`);
  });

  it('should render html tags as key', async () => {
    const translatedHtmlTagClassName: string = 'rendered-translation-tag';
    const translatedHtmlTagContent: string = '[translated_html_tag_content]';
    const translationWithHtmlTags: string = `
      <em class="${translatedHtmlTagClassName}">
        ${translatedHtmlTagContent}
      </em>
    `;
    component.showRenderableTranslation = true;
    translateService.nextTranslation = translationWithHtmlTags;
    fixture.detectChanges();
    await fixture.whenStable();
    // NOTE: cannot use DebugElement here because of some Angular limitations
    const rendered: HTMLElement = fixture.nativeElement.querySelector(`.${translatedHtmlTagClassName}`);
    expect(rendered).toBeTruthy();
    expect((rendered as HTMLSpanElement).textContent.trim()).toBe(translatedHtmlTagContent);
  });
});

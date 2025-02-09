import { Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { PebElement, PebElementId, PebElementStyling, PebElementType, PebPageStore, PebScreen } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { BaseFormAbstractComponent, ErrorBag, FormSchemeField } from '@pe/ng-kit/modules/form';
import { TranslateService } from '@pe/ng-kit/modules/i18n';

export abstract class WidgetsSettingsBase<T extends {}> extends BaseFormAbstractComponent<T, FormSchemeField>
  implements OnInit, OnDestroy {
  abstract component: AbstractElementComponent;
  abstract builderElement: PebElementType;

  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() pageStore: PebPageStore;

  protected errorBag: ErrorBag;
  protected translateService: TranslateService;
  protected updateColorFieldset$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(protected injector: Injector) {
    super(injector);
    this.errorBag = this.injector.get(ErrorBag);
    this.translateService = this.injector.get(TranslateService);
  }

  ngOnInit(): void {
    this.editor.activeElement$
      .pipe(
        tap((id: PebElementId) => {
          if (!id && this.component) {
            this.component = undefined;
          } else {
            this.component = this.registry.getComponent(id);
            if (this.component && this.component.element.type === this.builderElement) {
              this.resetForm();
            }
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
    this.updateColorFieldset$
      .pipe(
        debounceTime(300),
        tap(data => {
          if (data) {
            this.updateData(data);
          }
        }),
      )
      .subscribe();
  }

  abstract getInitialData(): any;

  protected resetForm(): void {
    if (this.form) {
      const initial = this.getInitialData();
      this.form.reset(initial, { emitEvent: false });
    }
  }

  protected updateData(data: any): void {
    if (!this.component && data.hasOwnProperty('style')) {
      this.pageStore.updateElement(this.pageStore.state.id, data);

      return;
    }

    if (data.hasOwnProperty('style')) {
      if (data.style.borderRadius) {
        data.style.borderRadius = Number(data.style.borderRadius);
      }
      data.style = this.setStylesForOtherScreens(data.style);
      this.component.setScreenStyle(data.style);
      this.pageStore.updateElement(this.component.id, data);
    } else {
      this.pageStore.updateElement(this.component.id, data);
    }
  }

  protected setStylesForOtherScreens(style: any): PebElementStyling {
    for (const prop of Object.keys(style)) {
      const value = style[prop];
      style[prop] = {};
      for (const screen of [PebScreen.Desktop, PebScreen.Tablet, PebScreen.Mobile]) {
        if (!this.component.screenStylesFixed(screen)) {
          style[prop][screen] = value;
        }
      }
      style[prop][this.component.screen] = value;
    }

    return style;
  }
}

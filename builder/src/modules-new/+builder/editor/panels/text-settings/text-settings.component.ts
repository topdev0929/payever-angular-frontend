import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { PebElementType, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { TextElementComponent } from '@pe/builder-editor/projects/modules/elements/src/basic/text.component';
import { TextTypes } from '@pe/builder-editor/projects/modules/elements/src/index';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { FontFamilies, TextEditorService, ToggleToolbarAction } from '@pe/builder-text-editor-compat';
import { FormScheme } from '@pe/ng-kit/modules/form';
import {
  ExecuteCommandAction,
  ExecuteCommands,
  LinksInterface,
  TextEditorToolbarComponent,
} from '@pe/ng-kit/modules/text-editor';
import { WidgetsSettingsBase } from '../../../common/widgets-settings-base';

@Component({
  selector: 'pe-builder-text-settings',
  templateUrl: 'text-settings.component.html',
  styleUrls: ['text-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextWidgetSettingsComponent extends WidgetsSettingsBase<any> implements OnInit {
  component: TextElementComponent;
  builderElement: PebElementType.Text;
  formScheme: FormScheme;

  businessId: string;
  showToolbar: boolean;
  fontFamilies = FontFamilies;

  getTextFromSlug$: Observable<boolean>;

  @Input()
  pageStore: PebPageStore;

  @Input()
  editor: EditorState;

  @Input()
  registry: ElementsRegistry;

  @Input() links: LinksInterface[] = [];

  @ViewChild('editorToolbar', { static: false })
  editorToolbar: TextEditorToolbarComponent;

  private fontsLoaded: { [key: string]: boolean } = {};

  constructor(
    protected injector: Injector,
    private activatedRoute: ActivatedRoute,
    private textEditorService: TextEditorService,
    private cdr: ChangeDetectorRef,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const trackBusinessId$: Observable<any> = this.activatedRoute.parent.params.pipe(
      tap((params: Params) => (this.businessId = params.businessId)),
    );
    const toggleTextEditor$: Observable<any> = this.textEditorService.toggleToolbarAction$.pipe(
      tap((event: ToggleToolbarAction) => {
        if (event.action === 'hideToolbar') {
          this.showToolbar = !event.value;

          return;
        }

        if (!this.editorToolbar) {
          return;
        }

        this.editorToolbar.handleActions(event);
      }),
    );

    merge(trackBusinessId$, toggleTextEditor$)
      .pipe(takeUntil(this.destroyed$))
      .subscribe();

    combineLatest([this.editor.activeElement$, this.registry.changes$]).subscribe(() => {
      this.cdr.detectChanges();
    });

    this.getTextFromSlug$ = combineLatest([this.editor.editedElement$, this.registry.changes$]).pipe(
      filter(([editedElement]) => !!editedElement),
      map(() => this.registry.getComponent(this.editor.editedElement)),
      filter(el => el && el.element && el.element.data && el.element.data.type),
      map(element => element.element.data.type === TextTypes.category),
    );
  }

  toggleToolbarAction(action: ExecuteCommandAction): void {
    if (action.key === ExecuteCommands.FONT_FAMILY) {
      const component: AbstractElementComponent = this.registry.getComponent(this.editor.editedElement);
      const documentAny = document as any;
      if (!this.fontsLoaded[action.key] && documentAny.fonts) {
        Promise.all([
          documentAny.fonts.load(`1px ${action.value}`),
          documentAny.fonts.load(`italic 1px ${action.value}`),
          documentAny.fonts.load(`bold 1px ${action.value}`),
          documentAny.fonts.load(`bold italic 1px ${action.value}`),
        ]).then(() => {
          this.textEditorService.triggerCommand$.next(action);
          component.setScreenStyle({ fontFamily: action.value });
          this.fontsLoaded[action.key] = true;
        });
      } else {
        this.textEditorService.triggerCommand$.next(action);
        component.setScreenStyle({ fontFamily: action.value });
      }
    } else {
      this.textEditorService.triggerCommand$.next(action);
    }
  }

  onSetLink(event: LinksInterface): void {
    this.pageStore.updateElement(this.editor.editedElement, {
      data: { link: event.id },
    });
  }

  onChangedGetTextFromSlug(checked: boolean): void {
    this.pageStore.updateElement(this.editor.editedElement, {
      data: {
        type: checked ? TextTypes.category : TextTypes.default,
      },
    });
  }

  @HostBinding('style.display')
  get styleDisplay(): string {
    return this.showToolbar ? 'flex' : 'none';
  }

  // tslint:disable-next-line:no-empty
  getInitialData(): void {}

  // tslint:disable-next-line:no-empty
  protected createForm(): void {}

  // tslint:disable-next-line:no-empty
  protected onUpdateFormData(formValues: any): void {}

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {}
}

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebCreateElement, PebElement, PebElementType, PebPageStore, PebScreen, PebThemeStore } from '@pe/builder-core';
import { EditorCommands, EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { pebSavePageToolbarData } from '@pe/builder-ui';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { LinksInterface } from '@pe/ng-kit/modules/text-editor';
import { NativeSections } from '../../../../../interfaces/native-sections.enum';
import { BaseThemeInterface } from '../../../../core/core.entities';
import { PageRoutingInterface } from '../../../entities/navbar';

@Component({
  selector: 'pe-builder-navbar-controls',
  templateUrl: './navbar-controls.component.html',
  styleUrls: ['./navbar-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarControlsComponent extends AbstractComponent implements OnInit {
  @Input() pageStore: PebPageStore;
  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() set pageRoutings(routes: PageRoutingInterface[]) {
    this.links = routes.map((route: PageRoutingInterface) => ({ id: route.routingId, title: route.name }));
  }
  @Input() theme: BaseThemeInterface;

  links: LinksInterface[] = [];
  isFooter = false;

  PebElementType = PebElementType;

  isDeleteDisabled$: Observable<boolean>;

  constructor(
    public themeStore: PebThemeStore,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isDeleteDisabled$ = this.pageStore.state$
      .pipe(
        switchMap(() => this.editor.selectedElements$),
        filter(elIds => !!elIds.length),
        map(elIds => elIds.map(id => this.registry.getComponent(id))),
        // tslint:disable:no-boolean-literal-compare
        map(elements => elements.every(el => el.element.meta.deletable === false)),
        takeUntil(this.destroyed$),
    );
  }

  onSectionCreate(): void {
    const section = pebCreateElement(PebElementType.Section, {
      data: { name: 'Section' },
      style: {
        height: 200,
        display: {
          [PebScreen.Desktop]: 'none',
          [PebScreen.Tablet]: 'none',
          [PebScreen.Mobile]: 'none',
          [this.editor.screen]: 'block',
        },
      },
      children: [],
    });

    if (this.editor.activeElement) {
      this.pageStore.appendElement(this.pageStore.state.id, section, {
        type: 'after',
        referenceId: this.editor.activeElement,
      });
    }
  }

  get activePebElement(): PebElement {
    if (!this.editor.activeElement) {
      return null;
    }
    const component: AbstractElementComponent = this.registry.getComponent(this.editor.activeElement);
    this.isFooter = this.validateFooter(component);

    return component && component.element;
  }

  get productElementsActive(): PebElement[] {
    return this.activePebElement && this.activePebElement.type === PebElementType.Product ? [this.activePebElement] : null;
  }

  onCopy(): void {
    this.editor.dispatchCommand(EditorCommands.copy);
  }

  onPaste(): void {
    this.editor.dispatchCommand(EditorCommands.paste);
  }

  onDelete(): void {
    this.editor.dispatchCommand(EditorCommands.delete);
  }

  onPageDataChanged(data): void {
    pebSavePageToolbarData(this.themeStore, this.themeStore.activePage, data);
  }

  validateFooter(component: AbstractElementComponent): boolean {
    if (!component || !component.element || !component.element.data) {
      return null;
    }

    const { name } = component.element.data;

    return name === NativeSections.TabletFooter ||
      name === NativeSections.MobileFooter ||
      name === NativeSections.DesktopFooter;
  }

  trackProduct(product: PebElement): string {
    return product ? product.id : null;
  }
}

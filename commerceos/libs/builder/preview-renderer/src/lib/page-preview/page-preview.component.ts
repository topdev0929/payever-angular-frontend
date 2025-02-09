import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { PebDefaultScreens, PebRenderContainer, PebScreen, PebScreenEnum } from '@pe/builder/core';
import { PebElement, PebLinkedList } from '@pe/builder/render-utils';
import { PebRendererService } from '@pe/builder/renderer';

@Component({
  selector: 'peb-page-preview',
  templateUrl: './page-preview.component.html',
  styleUrls: ['./page-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPagePreviewComponent implements OnChanges {

  element: any;
  renderContainer: PebRenderContainer = { key: 'preview', editMode: true, renderScripts: false };

  @Input() data: PebElement;
  @Input() screen: PebScreen;
  @Input() width: number;
  @Input() height: number;

  constructor(
    private rendererService: PebRendererService,
  ) {
  }

  styles: Partial<CSSStyleDeclaration>;

  ngOnChanges(changes: SimpleChanges): void {
    const screen = changes.screen?.currentValue ?? this.screen ?? PebDefaultScreens[PebScreenEnum.Desktop];
    const width = changes.width?.currentValue ?? this.width;
    const height = changes.height?.currentValue ?? this.height;
    const data = changes.data?.currentValue ?? this.data;

    if (changes.screen || changes.width || changes.height) {
      this.styles = {
        width: `${screen.width}px`,
        height: `${screen.width / width * height}px`,
        transformOrigin: 'top left',
        transform: `scale(${this.width / screen.width})`,
      };
    }

    if (data && screen && width && height) {
      const h = screen.width / width * height;
      const children = new PebLinkedList<PebElement>();
      let head = data.children.head;
      while (head && (!head.value.visible || head.value.minY < h)) {
        if (head.value.visible) {
          children.add(head.value);
        }
        head = head.next;
      }

      const recursive = (elm: PebElement) => {
        const viewElement = this.rendererService.renderElement(elm);

        if (!viewElement) {
          return undefined;
        }

        const children = new PebLinkedList<any>();
        for (const child of elm.children) {
          if (child.visible) {
            const viewElement = recursive(child);
            viewElement && children.add(viewElement);
          }
        }

        return { ...viewElement, children };
      };

      this.element = recursive({ ...data, children });
    }
  }
}

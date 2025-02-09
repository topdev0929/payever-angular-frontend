// TODO split file to smaller according to tslint rule
/* tslint:disable:max-file-line-count */
import { Injectable } from '@angular/core';
import { isObject } from 'lodash-es';

import {
  pebCreateElement,
  PebElement,
  PebElementProps,
  PebElementStyling,
  PebElementType,
  PebPageStore,
  PebScreen,
  PebScreenAwareStyle,
} from '@pe/builder-core';
import { DefaultNotificationColor } from '@pe/builder-editor/projects/modules/editor/src/common/editor.constants';
import {
  EditorAppendElementInterface,
  EditorState,
} from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { ButtonElementTypes, ShapesElementTypes } from '@pe/builder-editor/projects/modules/elements/src/index';
import { getScreenStyle, setScreenStyle } from '@pe/builder-editor/projects/modules/elements/src/utils';
import {
  CANVAS_MOBILE_WIDTH,
  CANVAS_TABLET_WIDTH,
  EDITOR_CONTENT_WIDTH,
} from '@pe/builder-editor/projects/modules/shared/interfaces';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { BuilderThemeComponent } from '../root/theme.component';

type SectionPositionType = 'fully-visible'
  | 'only-visible'
  | 'top-border-visible'
  | 'bottom-border-visible'
  | 'section-not-visible';

const { Line, Circle, Round, Rectangle } = ShapesElementTypes;

const DEFAULT_PRODUCT_WIDTH = 275;
const DEFAULT_SHAPE_WIDTH = 100;
const DEFAULT_TEXT_WIDTH = 33;
const DEFAULT_TEXT_HEIGHT = 22;
const DEFAULT_BUTTON_WIDTH = 70;
const EDFAULT_BUTTON_HEIGHT = 36;
const DEFAULT_DROPDOWN_WIDTH = 106;
const DEFAULT_CART_WIDTH = 30;
const DEFAULT_COLOR = '#03a9f4';

const defaultProductDef = (): PebElementProps => ({
  data: {
    itemSize: {
      width: {
        [PebScreen.Desktop]: 300,
        [PebScreen.Tablet]: 300,
        [PebScreen.Mobile]: 300,
      },
      height: {
        [PebScreen.Desktop]: 500,
        [PebScreen.Tablet]: 500,
        [PebScreen.Mobile]: 500,
      },
    },
    type: 'default',
  },
  style: {
    color: 'white',
    width: {
      [PebScreen.Desktop]: DEFAULT_PRODUCT_WIDTH,
      [PebScreen.Tablet]: DEFAULT_PRODUCT_WIDTH,
      [PebScreen.Mobile]: DEFAULT_PRODUCT_WIDTH,
    },
    height: {
      [PebScreen.Desktop]: DEFAULT_PRODUCT_WIDTH,
      [PebScreen.Tablet]: DEFAULT_PRODUCT_WIDTH,
      [PebScreen.Mobile]: DEFAULT_PRODUCT_WIDTH,
    },
  },
});

const defaultLogoDef = (): PebElementProps => ({
  style: {
    color: 'white',
    width: {
      [PebScreen.Desktop]: 120,
      [PebScreen.Tablet]: 120,
      [PebScreen.Mobile]: 120,
    },
    height: {
      [PebScreen.Desktop]: 100,
      [PebScreen.Tablet]: 100,
      [PebScreen.Mobile]: 100,
    },
  },
});

const defaultImageDef = (): PebElementProps => ({
  style: {
    width: {
      [PebScreen.Desktop]: 500,
      [PebScreen.Tablet]: 500,
      [PebScreen.Mobile]: 300,
    },
    height: {
      [PebScreen.Desktop]: 250,
      [PebScreen.Tablet]: 250,
      [PebScreen.Mobile]: 200,
    },
  },
  meta: {
    keepAspect: true,
  },
});

const defaultVideoDef = (): PebElementProps => ({
  style: {
    width: {
      [PebScreen.Desktop]: 500,
      [PebScreen.Tablet]: 500,
      [PebScreen.Mobile]: 300,
    },
    height: {
      [PebScreen.Desktop]: 250,
      [PebScreen.Tablet]: 250,
      [PebScreen.Mobile]: 200,
    },
  },
  data: {
    controls: true,
  },
  meta: {
    keepAspect: true,
  },
});

const defaultProductPageDef = (left: number): PebElementProps => ({
  style: {
    background: '#ffffff',
    width: EDITOR_CONTENT_WIDTH,
    height: {
      [PebScreen.Desktop]: 326,
      [PebScreen.Tablet]: 326,
      [PebScreen.Mobile]: 326,
    },
    left,
  },
});

const defaultShapeDef = (type: ShapesElementTypes): PebElementProps => ({
  style: {
    width: {
      [PebScreen.Desktop]: DEFAULT_SHAPE_WIDTH,
      [PebScreen.Tablet]: DEFAULT_SHAPE_WIDTH,
      [PebScreen.Mobile]: DEFAULT_SHAPE_WIDTH,
    },
    height: {
      [PebScreen.Desktop]: DEFAULT_SHAPE_WIDTH,
      [PebScreen.Tablet]: DEFAULT_SHAPE_WIDTH,
      [PebScreen.Mobile]: DEFAULT_SHAPE_WIDTH,
    },
    display: {
      [PebScreen.Desktop]: 'block',
      [PebScreen.Tablet]: 'block',
      [PebScreen.Mobile]: 'block',
    },
    background: {
      [PebScreen.Desktop]: DEFAULT_COLOR,
      [PebScreen.Tablet]: DEFAULT_COLOR,
      [PebScreen.Mobile]: DEFAULT_COLOR,
    },

    ...(type === Line && {
      height: {
        [PebScreen.Desktop]: 2,
        [PebScreen.Tablet]: 2,
        [PebScreen.Mobile]: 2,
      },
    }),
    ...(type === Round && {
      borderRadius: {
        [PebScreen.Desktop]: 20,
        [PebScreen.Tablet]: 20,
        [PebScreen.Mobile]: 20,
      },
    }),
    ...(type === Circle && {
      borderRadius: {
        [PebScreen.Desktop]: '50%',
        [PebScreen.Tablet]: '50%',
        [PebScreen.Mobile]: '50%',
      },
    }),
    ...(type === Rectangle && {}),
  },
  data: {
    type,
  },
});

const defaultAmountDef = (text: string): PebElementProps => ({
  text,
  data: {},
  style: {
    background: {
      [PebScreen.Desktop]: DEFAULT_COLOR,
      [PebScreen.Tablet]: DEFAULT_COLOR,
      [PebScreen.Mobile]: DEFAULT_COLOR,
    },
    color: {
      [PebScreen.Desktop]: '#ffffff',
      [PebScreen.Tablet]: '#ffffff',
      [PebScreen.Mobile]: '#ffffff',
    },
    borderRadius: {
      [PebScreen.Desktop]: 4,
      [PebScreen.Tablet]: 4,
      [PebScreen.Mobile]: 4,
    },
    fontWeight: {
      [PebScreen.Desktop]: 'bold',
      [PebScreen.Tablet]: 'bold',
      [PebScreen.Mobile]: 'bold',
    },
    fontSize: {
      [PebScreen.Desktop]: 12,
      [PebScreen.Tablet]: 12,
      [PebScreen.Mobile]: 12,
    },
    display: {
      [PebScreen.Desktop]: 'block',
      [PebScreen.Tablet]: 'block',
      [PebScreen.Mobile]: 'block',
    },
  },
});

const defaultButtonDef = (type: ButtonElementTypes): PebElementProps => ({
  text: 'Text',
  data: { type },
  style: {
    width: {
      [PebScreen.Desktop]: 64,
      [PebScreen.Tablet]: 64,
      [PebScreen.Mobile]: 64,
    },
    height: {
      [PebScreen.Desktop]: 36,
      [PebScreen.Tablet]: 36,
      [PebScreen.Mobile]: 36,
    },
    background: {
      [PebScreen.Desktop]: DEFAULT_COLOR,
      [PebScreen.Tablet]: DEFAULT_COLOR,
      [PebScreen.Mobile]: DEFAULT_COLOR,
    },
    color: {
      [PebScreen.Desktop]: '#ffffff',
      [PebScreen.Tablet]: '#ffffff',
      [PebScreen.Mobile]: '#ffffff',
    },
    borderRadius: {
      [PebScreen.Desktop]: 4,
      [PebScreen.Tablet]: 4,
      [PebScreen.Mobile]: 4,
    },
    fontWeight: {
      [PebScreen.Desktop]: 'bold',
      [PebScreen.Tablet]: 'bold',
      [PebScreen.Mobile]: 'bold',
    },
    fontSize: {
      [PebScreen.Desktop]: 12,
      [PebScreen.Tablet]: 12,
      [PebScreen.Mobile]: 12,
    },
    display: {
      [PebScreen.Desktop]: 'block',
      [PebScreen.Tablet]: 'block',
      [PebScreen.Mobile]: 'block',
    },
  },
});

const defaultCartDef = (): PebElementProps => ({
  data: {
    notificationBackground: DefaultNotificationColor,
    quantity: 1,
  },
  style: {
    width: {
      [PebScreen.Desktop]: DEFAULT_CART_WIDTH,
      [PebScreen.Tablet]: DEFAULT_CART_WIDTH,
      [PebScreen.Mobile]: DEFAULT_CART_WIDTH,
    },
    height: {
      [PebScreen.Desktop]: DEFAULT_CART_WIDTH,
      [PebScreen.Tablet]: DEFAULT_CART_WIDTH,
      [PebScreen.Mobile]: DEFAULT_CART_WIDTH,
    },
    display: {
      [PebScreen.Desktop]: 'block',
      [PebScreen.Tablet]: 'block',
      [PebScreen.Mobile]: 'block',
    },
    color: {
      [PebScreen.Desktop]: '#000000',
      [PebScreen.Tablet]: '#000000',
      [PebScreen.Mobile]: '#000000',
    },
    lineHeight: {
      [PebScreen.Desktop]: 8,
      [PebScreen.Tablet]: 8,
      [PebScreen.Mobile]: 8,
    },
  },
});

const defaultTextDef = (screen: PebScreen): PebElementProps => ({
  style: {
    height: {
      [PebScreen.Desktop]: DEFAULT_TEXT_HEIGHT,
      [PebScreen.Tablet]: DEFAULT_TEXT_HEIGHT,
      [PebScreen.Mobile]: DEFAULT_TEXT_HEIGHT,
    },
    fontSize: {
      [screen]: 15,
    },
  },
});

@Injectable()
export class ElementsFactory {
  constructor(
    private root: BuilderThemeComponent,
    private translateService: TranslateService,
  ) { }

  get editor(): EditorState {
    return this.root.editorComponent.context.editor;
  }

  get pageStore(): PebPageStore {
    return this.root.editorComponent.context.document;
  }

  createProduct(): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Product, defaultProductDef()));
  }

  createProductPage(left: number): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.ProductPage, defaultProductPageDef(left)));
  }

  createText(screen: PebScreen): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Text, defaultTextDef(screen)));
  }

  createShape(type: ShapesElementTypes): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Shape, defaultShapeDef(type)));
  }

  createButton(type: ButtonElementTypes): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Button, defaultButtonDef(type)));
  }

  createAmount(): void {
    // this.appendEditorElement(pebCreateElement(
    //   PebElementType.Amount,
    //   defaultAmountDef(this.translateService.translate('widgets.amount_name')),
    // ));
  }

  createCart(): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Cart, defaultCartDef()));
  }

  createLogo(): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Logo, defaultLogoDef()));
  }

  createImage(): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Image, defaultImageDef()));
  }

  createVideo(): void {
    // this.appendEditorElement(pebCreateElement(PebElementType.Video, defaultVideoDef()));
  }

  appendEditorElement(element: PebElement): void {
    // const parent: EditorAppendElementInterface = this.editor.findElementToAppend();
    // const parentCmp: AbstractElementComponent = this.editor.registry.getComponent(parent.id);
    // let parentId = parent.id;
    // const height = getElementHeight(element, this.editor.screen);

    // const elementBounds: PebElementStyling = this.makeScreenBoundaries(element, parentCmp.element);
    // const screenAwareDistance: PebScreenAwareStyle<number> = this.makeScreenAwareDistanceToLeftGrid(
    //   getScreenStyle(elementBounds.left, PebScreen.Desktop),
    // );
    // if (parent.component.element.type === PebElementType.Section) {
    //   const elementProps = this.getElementTopWhenInsertIntoSection(parent, height);
    //   elementBounds.top = setScreenStyle(elementBounds.top, elementProps.top, this.editor.screen, true);
    //   parentId = elementProps.parentUuid;
    // }

    // const screenAwareOtherStyles: PebElementStyling = this.makeScreenAwareOtherStyles(
    //   element.style,
    //   this.editor.screen,
    // );
    // // element.meta.screenStylesFixed = merge((element.meta.screenStylesFixed || {}), {[this.editor.screen]: true});
    // this.pageStore.appendElement(parentId, {
    //   ...element,
    //   style: {
    //     ...screenAwareOtherStyles,
    //     ...elementBounds,
    //     distanceToLeftGridLine: screenAwareDistance,
    //     display: {
    //       [PebScreen.Desktop]: 'none',
    //       [PebScreen.Tablet]: 'none',
    //       [PebScreen.Mobile]: 'none',
    //       [this.editor.screen]: 'block',
    //     },
    //   },
    // });

    // if (element.type === PebElementType.Product || element.type === PebElementType.ProductPage) {
    //   const cmp = this.editor.registry.getComponent(element.id);
    //   this.handleParentsResize(cmp);
    // }

    // this.editor.selectedElements = [element.id];
  }

  handleParentsResize(cmp: AbstractElementComponent): void {
    let elementHeight: number;

    switch (cmp.element.type) {
      case PebElementType.Product:
        const columns = getScreenStyle(cmp.element.style.columns, cmp.screen) || 1;
        const rows = cmp.element.data.products ? Math.ceil(cmp.element.data.products.length / columns) : 1;

        elementHeight = (cmp.element.data && cmp.element.data.itemSize
          ? cmp.element.data.itemSize.height[this.editor.screen]
          : 500) * rows;
        break;
      case PebElementType.ProductPage:
        elementHeight = 530;
        break;
      default:
        elementHeight = this.root.editorComponent.getBoundingRect(cmp).height;
        break;
    }

    const parentHeight = this.root.editorComponent.getBoundingRect(cmp.parentComponent).height;
    const widgetTop = parseInt(cmp.styleTop, 10);
    const neededHeight = elementHeight + widgetTop;

    if (parentHeight < neededHeight) {
      this.pageStore.updateElement(cmp.parentComponent.id, {
        style: {
          height: neededHeight,
        },
      });

      this.handleParentsResize(cmp.parentComponent);
    }
  }

  private makeScreenAwareOtherStyles(styles: PebElementStyling, screen: PebScreen): PebElementStyling {
    // NOTE: for now only styles for position and size transform to ScreenAware
    const stylesForTransform: string[] = ['height', 'widget'];

    for (const style of stylesForTransform) {
      if (styles[style]) {
        const defaultValue = styles[style][this.editor.screen] || styles[style];
        styles[style] = makeStyleForScreen(style, styles[style], screen, defaultValue);
      }
    }

    return styles;
  }

  private makeScreenBoundaries(element: PebElement, parent: PebElement): PebElementStyling {
    let screen: PebScreen;
    let left: number;
    let top: number;
    const canvasBoundaries = {
      [PebScreen.Desktop]: this.editor.canvasPosition.width,
      [PebScreen.Tablet]: CANVAS_TABLET_WIDTH,
      [PebScreen.Mobile]: CANVAS_MOBILE_WIDTH,
    };
    for (screen of [PebScreen.Desktop, PebScreen.Tablet, PebScreen.Mobile]) {
      const parentWidth: number = getScreenStyle(parent.style.width, screen) || canvasBoundaries[screen];
      const elmWidth = getElementWidth(element, screen);
      const elmHeight = getElementHeight(element, screen);
      left = parentWidth / 2 - elmWidth / 2;
      if (elmWidth > parentWidth) {
        element.style.width = setScreenStyle(
          element.style.width,
          Math.min(parentWidth, canvasBoundaries[screen]),
          screen,
        );
        left = 0;
      }
      element.style.left = setScreenStyle(element.style.left, left, screen);
      const parentHeight: number = getScreenStyle(parent.style.height, screen);
      top = parentHeight / 2 - elmHeight / 2;
      if (parentHeight && elmHeight > parentHeight) {
        element.style.height = setScreenStyle(element.style.height, parentHeight, screen);
        top = 0;
      }
      element.style.top = setScreenStyle(element.style.top, top, screen);
    }

    return element.style;
  }

  private makeScreenAwareDistanceToLeftGrid(defaultLeft: number): PebScreenAwareStyle<number> {
    const defaultDistanceToLeftGridLine: number = defaultLeft - this.editor.gridLinePosition.left;

    return makeStyleForScreen(
      'distanceToLeftGridLine',
      defaultDistanceToLeftGridLine,
      this.editor.screen,
      0,
    );
  }

  private getElementTopWhenInsertIntoSection(
    parent: EditorAppendElementInterface,
    height: number,
  ): { top: number, parentUuid: string } {
    const sectionCmp: AbstractElementComponent = parent.component;
    const sectionEl = sectionCmp.nativeElement;
    const { top: sectionTop, height: sectionHeight } = sectionEl.getBoundingClientRect();

    const canvasEl = this.root.editorComponent.canvasRef.nativeElement.parentElement;
    const { top: canvasTop, height: canvasHeight } = canvasEl.getBoundingClientRect();

    let parentUuid = parent.id;
    let top = (canvasTop + canvasHeight) / 2;

    const isVisibleOnlySectionTopBorder = sectionTop >= canvasTop
      && sectionTop < canvasTop + canvasHeight;

    const isVisibleOnlySectionBottomBorder = sectionTop + sectionHeight <= canvasTop + canvasHeight
      && sectionTop + sectionHeight > canvasTop;

    const isSectionOnlyInCanvas = sectionTop < canvasTop
      && sectionTop + sectionHeight > canvasTop + canvasHeight;

    const isSectionFullyVisible = isVisibleOnlySectionTopBorder && isVisibleOnlySectionBottomBorder;

    const isSectionOutsideOfView = sectionTop >= canvasTop + canvasHeight
      || sectionTop + sectionHeight < canvasTop;

    const caseValue: SectionPositionType
      = isSectionFullyVisible
        ? 'fully-visible'
        : isSectionOnlyInCanvas
          ? 'only-visible'
          : isVisibleOnlySectionTopBorder
            ? 'top-border-visible'
            : isVisibleOnlySectionBottomBorder
              ? 'bottom-border-visible'
              : 'section-not-visible';

    const centerOfCanvas = (canvasTop + canvasHeight) / 2;

    switch (caseValue) {
      case 'fully-visible':
        top = parent.dimensions.height / 2;
        break;
      case 'only-visible':
        const sectionOutsideOfCanvasHeight = canvasTop - sectionTop;
        top = sectionOutsideOfCanvasHeight + centerOfCanvas - height / 2;
        break;
      case 'top-border-visible':
        let visibleHeight = canvasHeight + canvasTop - sectionTop;
        top = visibleHeight / 2;
        break;
      case 'bottom-border-visible':
        visibleHeight = sectionHeight + sectionTop - canvasTop;
        const notVisibleHeight = sectionHeight - visibleHeight;
        top = notVisibleHeight + visibleHeight / 2;
        break;
      case 'section-not-visible':
        const screenCenter = (canvasEl.scrollTop + canvasEl.offsetHeight) / 2;
        this.pageStore.state.children.forEach((pebElement: PebElement) => {
          const cmp = this.editor.registry.getComponent(pebElement.id);
          const bounds = this.root.editorComponent.getBoundingRect(cmp);
          if (bounds.top < screenCenter && bounds.top + bounds.height > screenCenter) {
            top -= bounds.top;
            parentUuid = cmp.id;
          }
        });
        break;
      default:
        break;
    }
    top = top < height / 2 ? top : top - height / 2;
    if (top + height > parent.dimensions.height) {
      top = parent.dimensions.height - height;
    }
    if (height >= parent.dimensions.height) {
      top = 0;
    }

    return { top, parentUuid };
  }
}

const makeStyleForScreen = (
  styleName: string,
  value: any,
  currentScreen: PebScreen,
  defaultValue: number,
): any => {
  let valueClone: any = isObject(value) ? { ...value } : value;

  // NOTE: PebScreen.Any - not needed here
  const screens: PebScreen[] = [PebScreen.Tablet, PebScreen.Desktop, PebScreen.Mobile];

  // Value is Screen aware object
  if (isObject(valueClone)) {
    for (const screen of screens) {
      if (valueClone[screen] == null) {
        valueClone[screen] = defaultValue; // TODO for now only numeric value
      }
    }
  } else {
    const obj: PebScreenAwareStyle<number> = {};
    for (const screen of screens) {
      obj[screen] = screen === currentScreen ? (obj[screen] = valueClone) : defaultValue;
    }
    valueClone = obj;
  }

  return valueClone;
};

const getElementWidth = (element: PebElement, screen: PebScreen): number => {
  let elmWidth: number = getScreenStyle(element.style.width, screen);
  if (!elmWidth) {
    switch (element.type) {
      case PebElementType.Button:
        elmWidth = element.data.type === PebElementType.Button ? DEFAULT_BUTTON_WIDTH : DEFAULT_DROPDOWN_WIDTH;
        break;
      case PebElementType.Text:
        elmWidth = DEFAULT_TEXT_WIDTH;
        break;
      default:
        elmWidth = 100;
    }
  }

  return elmWidth;
};

const getElementHeight = (element: PebElement, screen: PebScreen): number => {
  let elmHeight: number = getScreenStyle(element.style.height, screen);
  if (!elmHeight) {
    switch (element.type) {
      case PebElementType.Button:
        elmHeight = EDFAULT_BUTTON_HEIGHT;
        break;
      default:
        elmHeight = 100;
    }
  }

  return elmHeight;
};

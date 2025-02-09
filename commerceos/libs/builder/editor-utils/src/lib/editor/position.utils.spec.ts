import { PebContentAlign, PebDefaultScreens, PebElementType, PebLayoutType, PebPositionType, PebScreenEnum, PebUnit } from '@pe/builder/core'
import {
  findElementHeightPixel,
  calculateChildrenBBox,
  calculateDocumentBBox,
  calculateElementsBBoxes,
  gridCellBBoxes,
  invisibleBBox,
  calculateBlocksBBox,
  applyDocumentBBoxUpdate,
  elementInnerSpace,
  containerPaddingSpace,
} from './position.utils';
import { elementBBox, paddingBBox } from './bbox.utils';
import { PebElement, PebLinkedList, getPebSize, getPebSizeOrAuto } from '@pe/builder/render-utils';

const desktop = PebDefaultScreens[PebScreenEnum.Desktop];
describe('Position Utils: document & elements bbox', () => {
  it('should calculate bbox for invisible element', () => {
    const element = { type: PebElementType.Shape, visible: false, } as any;

    calculateElementsBBoxes([element], undefined, 100);

    expect(elementBBox(element)).toEqual(invisibleBBox());
  });

  it('should calculate bbox for document', () => {
    const element = { type: PebElementType.Document } as any;

    calculateDocumentBBox(element, desktop);

    expect(elementBBox(element)).toEqual({
      minX: Number.NEGATIVE_INFINITY,
      minY: Number.NEGATIVE_INFINITY,
      maxX: Number.POSITIVE_INFINITY,
      maxY: Number.POSITIVE_INFINITY,
    });
  });

  it('should calculate bbox for section', () => {
    const document: PebElement = {
      type: PebElementType.Document,
      children: new PebLinkedList<PebElement>(),
    } as any;

    const section1: PebElement = {
      type: PebElementType.Section,
      styles: {
        position: {
          type: PebPositionType.Default,
          left: { value: 0, unit: PebUnit.Pixel },
          right: { value: 0, unit: PebUnit.Pixel },
        },
        dimension: {
          height: { value: 100, unit: PebUnit.Pixel },
          width: { value: 0, unit: PebUnit.Pixel },
        }
      },
    } as any;

    const section2: PebElement = {
      type: PebElementType.Section,
      styles: {
        position: {
          type: PebPositionType.Default,
          left: { value: 0, unit: PebUnit.Pixel },
          right: { value: 0, unit: PebUnit.Pixel },
        },
        dimension: {
          height: { value: 300, unit: PebUnit.Pixel },
          width: { value: 0, unit: PebUnit.Pixel },
        }
      },
    } as any;

    const section3: PebElement = {
      type: PebElementType.Section,
      styles: {
        position: {
          type: PebPositionType.Default,
          left: { value: 0, unit: PebUnit.Pixel },
          right: { value: 0, unit: PebUnit.Pixel },
        },
        dimension: {
          height: { value: 400, unit: PebUnit.Pixel },
          width: { value: 0, unit: PebUnit.Pixel },
        }
      },
    } as any;

    document.children?.add(section1);
    document.children?.add(section2);
    document.children?.add(section3);

    calculateDocumentBBox(document, desktop);

    expect(elementBBox(section1)).toEqual({ minX: 0, minY: 0, maxX: 1200, maxY: 100 });
    expect(elementBBox(section2)).toEqual({ minX: 0, minY: 100, maxX: 1200, maxY: 400 });
    expect(elementBBox(section3)).toEqual({ minX: 0, minY: 400, maxX: 1200, maxY: 800 });
  })

  it('should calculate bbox for inner shape by pixel', () => {
    const section: PebElement = {
      id: 'section',
      type: PebElementType.Section,
      children: new PebLinkedList<PebElement>(),
      minX: 0,
      maxX: 1200,
      minY: 1000,
      maxY: 1500,
    } as any;

    const shape: PebElement = {
      id: 'shape',
      type: PebElementType.Shape,
      styles: {
        position: {
          type: PebPositionType.Default,
          left: { value: 100, unit: PebUnit.Pixel },
          top: { value: 110, unit: PebUnit.Pixel },
        },
        dimension: {
          width: { value: 200, unit: PebUnit.Pixel },
          height: { value: 220, unit: PebUnit.Pixel },
        }
      },
    } as any;
    section.children?.add(shape);

    calculateChildrenBBox(section);

    expect(elementBBox(shape)).toEqual({
      minX: 100,
      minY: 1000 + 110,
      maxX: 100 + 200,
      maxY: 1000 + 110 + 220,
    });
  });

  it('should calculate bbox for inner shapes by pixel and padding', () => {
    const section: PebElement = {
      id: 'section',
      type: PebElementType.Section,
      children: new PebLinkedList<PebElement>(),
      styles: {
        padding: {
          top: 15,
          left: 16,
          right: 7,
          bottom: 8,
        },
      },
      minX: 0,
      maxX: screen,
      minY: 1000,
      maxY: 1500,
    } as any;

    const shape: PebElement = {
      id: 'shape',
      type: PebElementType.Shape,
      styles: {
        position: {
          type: PebPositionType.Block,
        },
        dimension: {
          width: { value: 200, unit: PebUnit.Pixel },
          height: { value: 220, unit: PebUnit.Pixel },
        },
      },
    } as any;

    section.children?.add(shape);

    calculateChildrenBBox(section);

    expect(elementBBox(shape)).toEqual({
      minX: 16,
      minY: 1000 + 15,
      maxX: 200 + 16,
      maxY: 1000 + 220 + 15,
    });
  });

  it('should calculate bbox for inner shape by percent', () => {
    const section: PebElement = {
      id: 'section',
      type: PebElementType.Section,
      children: new PebLinkedList<PebElement>(),
      minX: 0,
      maxX: 1000,
      minY: 100,
      maxY: 2100,
    } as any;

    const shape: PebElement = {
      id: 'shape',
      type: PebElementType.Shape,
      styles: {
        position: {
          type: PebPositionType.Default,
          left: { value: 10, unit: PebUnit.Percent },
          top: { value: 20, unit: PebUnit.Percent },
        },
        dimension: {
          width: { value: 50, unit: PebUnit.Percent },
          height: { value: 60, unit: PebUnit.Percent },
        }
      },
      parent: section,
    } as any;

    section.children?.add(shape);
    calculateChildrenBBox(section);

    expect(elementBBox(shape)).toEqual({
      minX: 1000 * 0.1,
      minY: 100 + (2000 * 20 / 100),
      maxX: (1000 * 10 / 100) + (1000 * 50 / 100),
      maxY: 100 + (2000 * 20 / 100) + (2000 * 60 / 100),
    });
  });

  it('should calculate bbox for grid cells', () => {
    const grid: PebElement = {
      id: 'grid',
      type: PebElementType.Grid,
      children: new PebLinkedList(),
      visible: true,
      styles: {
        gridTemplateColumns: [200, 500, 300],
        gridTemplateRows: [400, 1000, 600],
      },
      minX: 100,
      maxX: 1100,
      minY: 200,
      maxY: 2200,
    } as any;

    const cells: PebElement[] = [];
    for (let i = 0; i < 6; i++) {
      const cell: PebElement = {
        type: PebElementType.Shape,
        visible: true,
        parent: grid,
        styles: {
          layoutPosition: { index: i },
          position: { type: PebPositionType.Pinned },
          dimension: { width: getPebSize('100%'), height: getPebSize('100%') },
        }
      } as any;
      cells.push(cell);
      grid.children?.add(cell);
    }

    calculateChildrenBBox(grid);

    expect(elementBBox(cells[0])).toEqual({ minX: 100, minY: 200, maxX: 300, maxY: 600 });
  });

  it('should calculate bbox for pinned position', () => {
    const parent = {
      minX: 10,
      minY: 20,
      maxX: 1000,
      maxY: 500,
    } as any;

    const element1 = {
      styles: {
        position: {
          type: PebPositionType.Pinned,
          left: getPebSizeOrAuto('50px'),
          top: getPebSizeOrAuto('60px'),
          right: getPebSize('70px'),
          bottom: getPebSizeOrAuto('80px'),
        },
        dimension: {
          width: getPebSizeOrAuto('auto'),
          height: getPebSizeOrAuto('auto'),
        }
      }
    } as any;

    const element2 = {
      styles: {
        position: {
          type: PebPositionType.Pinned,
          left: getPebSizeOrAuto('50px'),
          top: getPebSizeOrAuto('60px'),
          right: getPebSize('auto'),
          bottom: getPebSizeOrAuto('auto'),
        },
        dimension: {
          width: getPebSizeOrAuto('100px'),
          height: getPebSizeOrAuto('200px'),
        }
      }
    } as any;


    calculateElementsBBoxes([element1, element2], parent);

    expect(elementBBox(element1)).toEqual(paddingBBox(parent, { left: 50, top: 60, right: 70, bottom: 80 }));
    expect(elementBBox(element2)).toEqual({ minX: 60, minY: 80, maxX: 160, maxY: 280 });
  })

  it('should calculate bbox for layout children which have pinned position', () => {
    const parent = {
      id: 'parent',
      styles: {
        layout: {
          type: PebLayoutType.Grid,
          rows: [{ value: 100, unit: PebUnit.Percent }],
          columns: [
            { value: 60, unit: PebUnit.Percent },
            { value: 40, unit: PebUnit.Percent }
          ],
        }
      },
      children: new PebLinkedList<PebElement>(),
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 500,
    } as any;

    const child = {
      id: 'child',
      parent,
      styles: {
        position: {
          type: PebPositionType.Pinned,
          left: { value: 10, unit: PebUnit.Pixel },
          top: { value: 20, unit: PebUnit.Pixel },
          right: { value: 30, unit: PebUnit.Pixel },
          bottom: { value: 40, unit: PebUnit.Pixel },
        },
        dimension: {
          width: getPebSize('auto'),
          height: getPebSize('auto'),
        },
        layoutPosition: {
          index: 0,
        },
      }
    } as any;

    parent.children.add(child);

    calculateChildrenBBox(parent);

    expect(elementBBox(child)).toEqual({ minX: 10, minY: 20, maxX: 570, maxY: 460 });
  });

  it('should calculate inner space for section', () => {
    const section = {
      type: PebElementType.Section,
      data: { fullWidth: false },
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 2000,
      screen: { width: 800, padding: 100 }
    } as any;

    expect(elementInnerSpace(section)).toEqual({ minX: 100, minY: 0, maxX: 900, maxY: 2000 });
  });

  it('should calculate inner space for element with padding', () => {
    const shape = {
      type: PebElementType.Shape,
      styles: {
        padding: {
          left: 100,
          top: 150,
          right: 200,
          bottom: 250,
        }
      },
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 2000,
    } as any;

    expect(elementInnerSpace(shape)).toEqual({ minX: 0, minY: 0, maxX: 1000, maxY: 2000 });
  });

  it('should calculate container padding space for element', () => {
    const parent = {
      type: PebElementType.Shape,
      styles: {
        padding: {
          left: 100,
          top: 150,
          right: 200,
          bottom: 250,
        }
      },
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 2000,
    } as any;

    const child = {
      type: PebElementType.Shape,
      name: 'test-1',
      parent,
    } as any;

    expect(containerPaddingSpace(child)).toEqual({ minX: 100, minY: 150, maxX: 1000 - 200, maxY: 2000 - 250 });
  });

});

describe('Position Utils: grid bbox', () => {
  it('should calculate grid cell bboxes by pixel', () => {
    const rows = [100, 200, 300];
    const cols = [400, 500, 600];

    const res = gridCellBBoxes(rows, cols, 1500, 600);

    expect(res.map((item: any) => item.bbox)).toEqual([
      { minX: 0, minY: 0, maxX: 400, maxY: 100 },
      { minX: 400, minY: 0, maxX: 900, maxY: 100 },
      { minX: 900, minY: 0, maxX: 1500, maxY: 100 },

      { minX: 0, minY: 100, maxX: 400, maxY: 300 },
      { minX: 400, minY: 100, maxX: 900, maxY: 300 },
      { minX: 900, minY: 100, maxX: 1500, maxY: 300 },

      { minX: 0, minY: 300, maxX: 400, maxY: 600 },
      { minX: 400, minY: 300, maxX: 900, maxY: 600 },
      { minX: 900, minY: 300, maxX: 1500, maxY: 600 },
    ]);
  });

  it('should calculate grid cell bboxes by percent', () => {
    const unit = PebUnit.Percent;
    const rows = [{ value: 10, unit }, { value: 20, unit }, { value: 70, unit }];
    const cols = [{ value: 40, unit }, { value: 50, unit }, { value: 10, unit }];

    const res = gridCellBBoxes(rows, cols, 1000, 1000);

    expect(res.map((item: any) => item.bbox)).toEqual([
      { minX: 0, minY: 0, maxX: 400, maxY: 100 },
      { minX: 400, minY: 0, maxX: 900, maxY: 100 },
      { minX: 900, minY: 0, maxX: 1000, maxY: 100 },

      { minX: 0, minY: 100, maxX: 400, maxY: 300 },
      { minX: 400, minY: 100, maxX: 900, maxY: 300 },
      { minX: 900, minY: 100, maxX: 1000, maxY: 300 },

      { minX: 0, minY: 300, maxX: 400, maxY: 1000 },
      { minX: 400, minY: 300, maxX: 900, maxY: 1000 },
      { minX: 900, minY: 300, maxX: 1000, maxY: 1000 },
    ]);
  });
})

describe('Auto width/height size', () => {
  it('should calculate height of element based on inner elements', () => {
    const elm = {
      id: 'parent',
      children: new PebLinkedList(),
      styles: {
        dimension: { width: getPebSize(100), height: getPebSize('auto') },
        position: { left: getPebSize(0), top: getPebSize(10) }
      }
    } as any;

    const child1 = {
      id: 'child',
      styles: {
        dimension: { width: getPebSize(1000), height: getPebSize(2000) },
        position: { left: getPebSize(100), top: getPebSize(200) }
      },
    } as any;

    elm.children.add(child1);

    expect(findElementHeightPixel(elm, 1000)).toEqual(2200);
  });

  it('should calculate inline-block bbox for elements', () => {
    const elm1 = {
      styles: {
        position: {
          type: PebPositionType.InlineBlock,
        },
        dimension: {
          width: getPebSize(100),
          height: getPebSize(100),
        }
      }
    } as any;

    const elm2 = {
      styles: {
        position: {
          type: PebPositionType.InlineBlock,
        },
        dimension: {
          width: getPebSize(100),
          height: getPebSize(100),
        }
      }
    } as any;

    const elm3 = {
      styles: {
        position: {
          type: PebPositionType.InlineBlock,
        },
        dimension: {
          width: getPebSize(300),
          height: getPebSize(100),
        }
      }
    } as any;

    const container = { minX: 100, minY: 200, maxX: 100 + 300, maxY: 1000 };

    calculateBlocksBBox([elm1, elm2, elm3], container);

    expect(elementBBox(elm1)).toEqual({ minX: 100, minY: 200, maxX: 200, maxY: 300 });
    expect(elementBBox(elm2)).toEqual({ minX: 200, minY: 200, maxX: 300, maxY: 300 });
    expect(elementBBox(elm3)).toEqual({ minX: 100, minY: 300, maxX: 400, maxY: 400 });
  });

  it('should calculate block bbox for elements', () => {
    const elm1 = {
      styles: {
        position: {
          type: PebPositionType.Block,
        },
        dimension: {
          width: getPebSize(100),
          height: getPebSize(100),
        }
      }
    } as any;

    const elm2 = {
      styles: {
        position: {
          type: PebPositionType.Block,
        },
        dimension: {
          width: getPebSize(100),
          height: getPebSize(100),
        }
      }
    } as any;

    const elm3 = {
      styles: {
        position: {
          type: PebPositionType.Block,
        },
        dimension: {
          width: getPebSize(300),
          height: getPebSize(100),
        }
      }
    } as any;

    const container = { minX: 100, minY: 200, maxX: 100 + 300, maxY: 1000 };

    calculateBlocksBBox([elm1, elm2, elm3], container);

    expect(elementBBox(elm1)).toEqual({ minX: 100, minY: 200, maxX: 200, maxY: 300 });
    expect(elementBBox(elm2)).toEqual({ minX: 100, minY: 300, maxX: 200, maxY: 400 });
    expect(elementBBox(elm3)).toEqual({ minX: 100, minY: 400, maxX: 400, maxY: 500 });
  });

  it('should apply content align on blocks', () => {
    const container = {
      id: 'container',
      children: new PebLinkedList(),
      minX: 0,
      minY: 0,
      maxX: 200,
      maxY: 1000,
    } as any;

    const inlineBlock1 = {
      id: 'inline-block-1',
      styles: {
        position: {
          type: PebPositionType.InlineBlock,
        },
        dimension: {
          width: getPebSize(50),
          height: getPebSize(50),
        },
      },
    } as any;

    const inlineBlock2 = {
      id: 'inline-block-2',
      styles: {
        position: {
          type: PebPositionType.InlineBlock,
        },
        dimension: {
          width: getPebSize(70),
          height: getPebSize(50),
        },
      },
    } as any;

    container.children.add(inlineBlock1);
    container.children.add(inlineBlock2);

    calculateBlocksBBox([inlineBlock1, inlineBlock2], container, PebContentAlign.canter);

    const moveX = (200 - 120) / 2;

    expect(elementBBox(inlineBlock1)).toEqual({ minX: moveX, minY: 0, maxX: 50 + moveX, maxY: 50 });
    expect(elementBBox(inlineBlock2)).toEqual({ minX: 50 + moveX, minY: 0, maxX: 120 + moveX, maxY: 50 });

  });
});

describe('Recalculate BBOX', () => {
  it('should return affectedBBox when section changes', () => {
    const document = { id: 'document', children: new PebLinkedList() } as any;
    const section1 = { id: 'section-1', parent: document, minX: 0, minY: 0, maxX: 100, maxY: 10 } as any;
    const section2 = { id: 'section-2', parent: document, minX: 0, minY: 10, maxX: 100, maxY: 20 } as any;
    const section3 = { id: 'section-3', parent: document, minX: 0, minY: 20, maxX: 100, maxY: 50 } as any;

    document.children.add(section1);
    document.children.add(section2);
    document.children.add(section3);

    const changes = { [section2.id]: { width: 100, height: 400 } };

    applyDocumentBBoxUpdate(document, changes);

    expect(elementBBox(section1)).toEqual({ minX: 0, minY: 0, maxX: 100, maxY: 10 });
  });
});

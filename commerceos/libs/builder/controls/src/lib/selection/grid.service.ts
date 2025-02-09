import { Injectable } from '@angular/core';
import { applyToPoint, compose, Matrix, scale, translate } from 'transformation-matrix';

import { PebElementType } from '@pe/builder/core';
import { PeAnchorType, PebAnchorType } from '@pe/builder/events';
import { PebElement } from '@pe/builder/render-utils';
import { PebDefRTree } from '@pe/builder/tree';

import { isGridElement } from './selection';


@Injectable({ providedIn: 'any' })
export class PebGridService {

  constructor(
    private readonly tree: PebDefRTree,
  ) {
  }

  /** @deprecated */
  getGridByAnchor(anchor: PeAnchorType): PebElement & { type: PebElementType.Grid } {
    // todo : saved just for move service - will removed in future
    /** Find the grid anchor belongs to */
    let { minX, minY, maxX, maxY } = anchor;

    let matrix: Matrix;
    switch (anchor.type) {
      case PebAnchorType.EW:
        matrix = compose(translate(-1, 1), scale(-1, -1,  minX, maxY));
        break;
      case PebAnchorType.NS:
        matrix = compose(translate(1, -1), scale(-1, -1,  maxX, minY));
        break;
      case PebAnchorType.ColResize:
        matrix = compose(translate(0, 1), scale(-1, -1,  minX + (maxX - minX) / 2, maxY));
        break;
      case PebAnchorType.RowResize:
        matrix = compose(translate(1, 0), scale(-1, -1,  maxX, minY + (maxY - minY) / 2));
        break;
      case PebAnchorType.Move:
        matrix = compose(translate(1, 1), scale(-1, -1,  maxX, maxY));
        break;
    }

    const [x1, y1] = applyToPoint(matrix, [maxX, maxY]);
    const [x2, y2] = applyToPoint(matrix, [minX, minY]);

    const elms = this.tree.search({ minX: x1, minY: y1, maxX: x2, maxY: y2 });
    const grid = elms.find(elm => isGridElement(elm));

    return grid as PebElement & { type: PebElementType.Grid };
  }
}

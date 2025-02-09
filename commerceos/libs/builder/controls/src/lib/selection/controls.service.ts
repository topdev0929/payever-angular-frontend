import { Injectable, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, tap, throttleTime } from 'rxjs/operators';

import { PebElementType } from '@pe/builder/core';
import { findTotalArea, elementBBox } from '@pe/builder/editor-utils';
import {
  PeAnchorType,
  PebAnchorsService,
  PebAnchorType,
} from '@pe/builder/events';
import { PebElement, isDocument, isSection, isText } from '@pe/builder/render-utils';
import { PebEditorState, PebEditTextModel, PebOptionsState } from '@pe/builder/state';

import { elementAnchors, gridAnchors } from './anchors';
import {
  isGridControl,
  isSectionControl,
  PebControl,
  PebControlAnchorType,
  PebControlColor,
  PebControlCommon,
  PebGridControl,
  PebGridControlColumn,
  PebGridControlRow,
} from './controls';
import { findGroupedElements } from './selection';


@Injectable({ providedIn: 'any' })
export class PebControlsService implements OnDestroy {

  @Select(PebOptionsState.scale) scale$!: Observable<number>;
  @Select(PebEditorState.editText) textEdit$!: Observable<PebEditTextModel>;

  anchorRadius = 4;
  gridRuler = 16;
  gridSeparator = 8;
  gridRulerColor = '#1c1c1e';

  controls$ = new BehaviorSubject<PebControlCommon[]>([]);
  controlsData$: Observable<{ controls: PebControl[]; scale: number }> = combineLatest([
    this.controls$,
    this.scale$,
  ]).pipe(
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    map(([controls, scale]) => {
      return controls.reduce((acc, control) => {
        const anchors = isGridControl(control)
          ? gridAnchors(control, scale, this.gridRuler, this.gridSeparator)
          : elementAnchors(control, scale, this.anchorRadius);

        acc.anchors.push(...anchors);

        acc.controls.push({
          anchorType: control.anchorType,
          x: control.minX,
          y: control.minY,
          width: control.maxX - control.minX,
          height: control.maxY - control.minY,
          color: control.color,
          ...{ gridColor: isGridControl(control) ? control.gridColor : undefined },
          label: isSectionControl(control) ? control.label : undefined,
          anchors: anchors.reduce((acc, anchor) => {

            const width = anchor.maxX - anchor.minX;
            const height = anchor.maxY - anchor.minY;
            const hw = this.gridSeparator / 2 / scale;

            if (isGridControl(control)) {
              if (PebAnchorType.ColSelect === anchor.type) {
                acc.push({
                  width: width + (anchor.minX > control.minX ? hw * 2 : hw),
                  height,
                  x: anchor.minX > control.minX ? anchor.minX - hw : anchor.minX,
                  y: anchor.minY,
                  color: anchor.selected ? control.color : this.gridRulerColor,
                  label: String.fromCharCode('A'.charCodeAt(0) + anchor.index),
                });
              }

              if (PebAnchorType.RowSelect === anchor.type) {
                acc.push({
                  width,
                  height: height + (anchor.minY > control.minY ? hw * 2 : hw),
                  x: anchor.minX,
                  y: anchor.minY > control.minY ? anchor.minY - hw : anchor.minY,
                  color: anchor.selected ? control.color : this.gridRulerColor,
                  label: `${anchor.index + 1}`,
                });
              }

              return acc;
            }

            acc.push({
              width,
              height,
              x: anchor.minX + width / 2,
              y: anchor.minY + height / 2,
              color: control.color,
            });

            return acc;
          }, []),
        });

        return acc;
      }, { anchors: [] as PeAnchorType[], controls: [] as PebControl[], scale });
    }),
    tap(({ anchors }) => {
      this.anchorService.clear();
      this.anchorService.load(anchors);
    }),
    map(({ controls, scale }) => ({ controls, scale: scale > 0 ? 1 / scale : scale })),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly anchorService: PebAnchorsService,
  ) {
  }

  getControls(): PebControlCommon[] {
    return this.controls$.value;
  }

  renderControls(items: PebControlCommon[]) {
    this.controls$.next(items);
  }

  createDefaultControlsSet(elements: PebElement[], openGroup?: string): PebControlCommon[] {

    /** Do not render controls if Document is only selected element */
    const isSingleElement = elements.length === 1;

    if (isSingleElement && isDocument(elements[0])) {
      return [];
    }

    if (isSingleElement && isText(elements[0])) {
      return [this.getTextControl(elements[0])];
    }

    /** Skip controls rendering for grouped elements, use groups bounding instead */
    const selectedGroups = findGroupedElements(elements, openGroup);
    const controls = elements.reduce((acc, elm) => {
      if (elm.type !== PebElementType.Section) {
        const isGrouped = elm.data?.groupId?.some(id => selectedGroups.has(id));
        if (!isGrouped) {
          acc.push({
            elements: [elm],
            ...elm,
            anchorType: PebControlAnchorType.None,
            color: PebControlColor.Default,
          });
        }
      }

      return acc;
    }, [] as PebControlCommon[]);

    selectedGroups.forEach((items) => {
      controls.push({
        elements: items,
        ...findTotalArea(items),
        anchorType: PebControlAnchorType.None,
        color: PebControlColor.Default,
      });
    });

    /**
     * Should render grid controls if all selected elements have same grid element as root parent.
     * If grid controls should be renderer, also selected cells controls should be rendered.
     */
    const grids = new Map<string, PebElement>();
    elements.forEach((elm) => {
      let root = elm;
      while (root.parent && root.type !== PebElementType.Grid) {
        root = root.parent;
      }
      if (root.type === PebElementType.Grid && !grids.has(root.id)) {
        grids.set(root.id, root);
      }
    });

    if (grids.size === 1) {
      const grid = [...grids.values()][0];

      const allElementsInsideGrid = elements.some((elm) => {
        let parent = elm.parent;
        while (parent && parent?.id !== grid.id) {
          parent = parent.parent;
        }

        return parent?.id === grid.id;
      });

      if (allElementsInsideGrid || elements.length === 1) {
        controls.push(this.createGridControl(grid));

        const cells = elements.filter(elm => elm.parent?.id === grid.id);

        cells.forEach((elm) => {
          controls.push({
            elements: [elm],
            ...elm,
            anchorType: PebControlAnchorType.None,
            color: PebControlColor.Default,
          });
        });

        const nonCells = elements.filter(elm => ![elm.id, elm.parent?.id].includes(grid.id));

        if (nonCells.length) {
          controls.push({
            elements: nonCells,
            anchorType: PebControlAnchorType.Default,
            color: PebControlColor.Default,
            ...findTotalArea(nonCells),
          });
        }
      } else {
        controls.push({
          elements,
          anchorType: PebControlAnchorType.Default,
          color: PebControlColor.Default,
          ...findTotalArea(elements),
        });
      }
    } else if (elements.every(isSection)) {
      elements.forEach(elm => controls.push(this.getSectionControl(elm)));
    } else if (elements.length > 0) {
      controls.push(this.getDefaultControl(elements));
    }

    return controls;
  }

  /** Create grid columns and rows controls */
  createGridControl(element: PebElement, color = PebControlColor.Default, gridColor?: string): PebGridControl {
    const firstLetter = 'A'.charCodeAt(0);
    const columns = element.styles.gridTemplateColumns.reduce<PebGridControlColumn[]>((acc, width, index) => {
      const minX = acc[acc.length - 1]?.maxX ?? 0;

      acc.push({
        minX,
        maxX: minX + width,
        label: String.fromCharCode(firstLetter + index),
        selected: false,
      });

      return acc;
    }, []);

    const rows = element.styles.gridTemplateRows.reduce<PebGridControlRow[]>((acc, height, index) => {
      const minY = acc[acc.length - 1]?.maxY ?? 0;

      acc.push({
        minY,
        index,
        maxY: minY + height,
        selected: false,
      });

      return acc;
    }, []);

    return {
      elements: [element],
      columns,
      rows,
      color,
      gridColor,
      anchorType: PebControlAnchorType.Grid,
      ...element,
    };
  }

  getTextControl(elm: PebElement): PebControlCommon {
    return {
      elements: [elm],
      anchorType: PebControlAnchorType.Text,
      color: PebControlColor.Default,
      ...elementBBox(elm),
    };
  }

  getTextEditorControl(elm: PebElement): PebControlCommon {
    return {
      elements: [elm],
      anchorType: PebControlAnchorType.None,
      color: PebControlColor.TextEditor,
      ...elementBBox(elm),
    };
  }

  getDefaultControl(elements: PebElement[]): PebControlCommon {
    return {
      elements,
      anchorType: PebControlAnchorType.Default,
      color: PebControlColor.Default,
      ...findTotalArea(elements),
    };
  }

  getSectionControl(elm: PebElement): PebControlCommon {
    return {
      elements: [elm],
      anchorType: PebControlAnchorType.Section,
      color: PebControlColor.Default,
      ...elm,
      label: elm.name ? elm.name : 'Section',
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}

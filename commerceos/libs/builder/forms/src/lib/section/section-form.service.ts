import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PebElementType, PebPositionType, PebSize } from '@pe/builder/core';
import { getPebSize, PebElement } from '@pe/builder/render-utils';
import { PebArrangeElementsAction, PebElementsState, PebUpdateAction, PebUpdateActionPayload } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebSectionFormService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  constructor(
    private readonly store: Store,
  ) {
  }

  setSection(value: Partial<SectionFormModel>): boolean {
    const [element] = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload: PebUpdateActionPayload = [];

    value.default !== undefined && payload.push({
      id: element.id, meta: { deletable: value.default },
    });
    value.fullWidth !== undefined && payload.push({
      id: element.id, data: { fullWidth: value.fullWidth },
    });
    value.fullHeight !== undefined && payload.push(
      { id: element.id, styles: { dimension: { fullDeviceHeight: value.fullHeight } } }
    );
    value.height !== undefined && payload.push({
      id: element.id, styles: { dimension: { height: value.height } },
    });
    value.minHeight !== undefined && payload.push({
      id: element.id, styles: { dimension: { minHeight: value.minHeight } },
    });
    value.maxHeight !== undefined && payload.push({
      id: element.id, styles: { dimension: { maxHeight: value.maxHeight } },
    });
    value.sticky !== undefined && payload.push({
      id: element.id, styles: { position: { type: PebPositionType.Sticky, top: getPebSize(0) } },
    });

    this.store.dispatch(new PebUpdateAction(payload));

    return true;
  }

  toFormValue(section: PebElement): SectionFormModel {
    return {
      default: section.meta?.deletable === false,
      sticky: section.styles.position?.type === PebPositionType.Sticky ?? false,
      fullWidth: section.data?.fullWidth ?? false,
      fullHeight: section.styles?.dimension?.fullDeviceHeight ?? false,
      height: section.styles.dimension?.height ?? getPebSize('auto'),
      minHeight: section.styles.dimension?.minHeight ?? getPebSize('auto'),
      maxHeight: section.styles.dimension?.maxHeight ?? getPebSize('auto'),
    };
  }

  changePosition(delta: 1 | -1) {
    const selected = this.store.selectSnapshot(PebElementsState.selected);
    if (selected.length === 1 && selected[0].type === PebElementType.Section) {
      const [section] = selected;
      /** Can't go beyond the range of visible children */
      const visible = [...section.parent.children].filter(elm => elm.visible);
      const currentIndex = visible.findIndex(elm => elm.id === section.id);
      const nextIndex = Math.max(0, Math.min(currentIndex + delta, visible.length - 1));
      if (currentIndex !== nextIndex) {
        this.store.dispatch(new PebArrangeElementsAction(section, delta));
      }
    }
  }
}

export interface SectionFormModel {
  default: boolean;
  sticky: boolean;
  fullWidth: boolean;
  fullHeight: boolean;
  height: PebSize;
  minHeight: PebSize;
  maxHeight: PebSize;
}

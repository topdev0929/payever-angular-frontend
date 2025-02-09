import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import {
  PebElementType,
  PebPositionType,
  PebScreen,
  PebUnit,
  isBlockPosition,
  isInlineBlockPosition,
  isStickyPosition,
} from '@pe/builder/core';
import { PebElement, getPebSize, isSection } from '@pe/builder/render-utils';
import { PebArrangeElementsAction, PebElementsState, PebOptionsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebFormOption } from '../models';

import * as constants from './position-form.constants';
import { PebPositionFormService } from './position-form.service';

@Component({
  selector: 'peb-position-form',
  templateUrl: './position-form.component.html',
  styleUrls: ['./position-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebPositionForm {
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;
  @Select(PebElementsState.selectedElements) private readonly selected$!: Observable<PebElement[]>;

  elementPositionTypes = constants.elementPositionTypes;
  sectionPositionTypes = constants.sectionPositionTypes;
  positionType = PebPositionType;  
  canChangePosition = false;
  showArrangeButtons$ = this.selected$.pipe(
    filter(elements => !!elements),
    map(elements => elements.every(elm => !isSection(elm)))
  );

  positionForm = this.formBuilder.group({
    type: this.formBuilder.control(PebPositionType.Default),
    left: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
    top: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
    right: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
    bottom: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
  });

  positionTypes$: Observable<PebFormOption[]> = this.selected$.pipe(
    filter(elements => !!elements),
    map(elements => elements.some(isSection) ? this.sectionPositionTypes : this.elementPositionTypes),
  );

  showSectionStickyOption$: Observable<boolean> = this.selected$.pipe(
    map(elements => elements?.every(elm => isSection(elm) && isStickyPosition(elm.styles.position))),
  );

  syncEnabled$: Observable<boolean> = this.service.syncEnabled$;

  constructor(
    private readonly service: PebPositionFormService,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.positionForm.valueChanges.pipe(
      tap(position => this.service.setPosition(position)),
      takeUntil(this.destroy$),
    ).subscribe();

    service.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      tap(([element]) => {
        this.canChangePosition =
          element.type !== PebElementType.Section
          && !isInlineBlockPosition(element.styles.position)
          && !isBlockPosition(element.styles.position);

        if (!element.styles.position) {
          return;
        }

        const position = {
          ...element.styles.position,
          left: getPebSize(element.styles.position.left ?? 'auto'),
          top: getPebSize(element.styles.position.top ?? 'auto'),
          right: getPebSize(element.styles.position.right ?? 'auto'),
          bottom: getPebSize(element.styles.position.bottom ?? 'auto'),
        };

        this.positionForm.patchValue(position, { emitEvent: false });

        this.positionForm.markAsUntouched();
        this.positionForm.markAsPristine();
      })).subscribe();
  }

  changePosition(delta: 1 | -1) {
    const selected = this.store.selectSnapshot(PebElementsState.selected);

    if (!selected || selected.length > 1) {
      return;
    }

    const [section] = selected;
    const visible = [...section.parent.children].filter(elm => elm.visible);
    const currentIndex = visible.findIndex(elm => elm.id === section.id);
    const nextIndex = Math.max(0, Math.min(currentIndex + delta, visible.length - 1));
    if (currentIndex !== nextIndex) {
      this.store.dispatch(new PebArrangeElementsAction(section, delta));
    }
  }
}

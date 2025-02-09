import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select } from '@ngxs/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebScreen, PebSize } from '@pe/builder/core';
import { getPebSize, isSection, PebElement } from '@pe/builder/render-utils';
import { PebOptionsState, PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebSectionFormService, SectionFormModel } from './section-form.service';


@Component({
  selector: 'peb-section',
  templateUrl: './section-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './section-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebSectionFormComponent {

  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebElementsState.selected) selectedElements$!: Observable<PebElement[]>;

  previousValue: { height: PebSize };

  sectionForm = this.formBuilder.group({
    default: false,
    sticky: false,
    fullWidth: false,
    fullHeight: false,
    height: getPebSize('auto'),
    minHeight: getPebSize('auto'),
    maxHeight: getPebSize('auto'),
  });

  setSectionForm$ = this.selectedElements$.pipe(
    filter(elements => elements?.length === 1 && isSection(elements[0])),
    tap(([section]) => {
      this.previousValue = { height: section.styles.dimension?.height };
      const value = this.sectionFormService.toFormValue(section);
      this.sectionForm.setValue(value);
      this.formOptions$.next(this.getFormOptions(value));
    }),
  );

  formOptions$ = new BehaviorSubject<FormOptions>({});

  sectionFormChanges$ = this.sectionForm.valueChanges.pipe(
    filter(() => this.sectionForm.dirty),
    distinctUntilChanged((a, b) => isEqual(a, b)),
    tap(() => {
      const value = this.getDirtyValues();
      const valid = this.sectionFormService.setSection(value);

      valid
        ? this.previousValue = { height: this.sectionForm.get('height').value }
        : setTimeout(() => this.sectionForm.patchValue(this.previousValue, { emitEvent: false }));

      this.sectionForm.markAsPristine();
      this.sectionForm.markAsUntouched();
    }),
  );

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
    private readonly sectionFormService: PebSectionFormService,
  ) {
    merge(this.setSectionForm$, this.sectionFormChanges$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }

  getDirtyValues(): Partial<SectionFormModel> {
    const payload: Partial<SectionFormModel> = {};

    Object.entries(this.sectionForm.value).forEach(([key, val]) => {
      const control = this.sectionForm.controls[key];
      if (control?.dirty) {
        payload[key] = val;
      }
    });

    return payload;
  }

  changePosition(delta: 1 | -1) {
    this.sectionFormService.changePosition(delta);
  }

  getFormOptions(form: SectionFormModel): FormOptions {
    return {
      showHeight: !form.fullHeight,
      showHeightLimit: form.fullHeight,
    };
  }

}

interface FormOptions {
  showHeight?: boolean;
  showHeightLimit?: boolean;
}

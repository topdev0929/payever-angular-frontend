import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebUpdateTextStyleAction } from '@pe/builder/actions';
import { SelectOption } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebTextPresetStylesFormService } from './text-preset-styles-form.service';

@Component({
  selector: 'peb-text-preset-styles-form',
  templateUrl: './text-preset-styles-form.component.html',
  styleUrls: ['./text-preset-styles-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, PebTextPresetStylesFormService],
})
export class PebTextPresetStylesFormComponent {
  @Select(PebElementsState.selected) private readonly selected$!: Observable<PebElement[]>;

  predefinedStyles: SelectOption[] = [
    { name: 'None', value: 'None' },
    ...this.presetService.getPresetStyles().map(value => ({ name: value.name, value: value.name })),
  ];

  formGroup = new FormGroup({
    name: new FormControl(''),
    textStyleName: new FormControl(''),
  });

  constructor(
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
    private readonly presetService: PebTextPresetStylesFormService,
  ) {
    this.selected$.pipe(
      filter(selected => !!selected?.length),
      tap(([selected]) => {
        const textStyleName = selected.data?.textStyleName ?? 'None';
        const textStyle = selected.styles.textStyles;

        const name = !this.presetService.isPresetStyleUnchanged(textStyleName, textStyle)
          ? textStyleName + '*'
          : textStyleName;

        this.formGroup.markAsPristine();
        this.formGroup.patchValue({ name, textStyleName });
      }),
      switchMap(selected => this.formGroup.valueChanges.pipe(
        filter(() => this.formGroup.dirty),
        tap(() => {
          const { textStyleName } = this.formGroup.value;
          const style = this.presetService.getPresetStyle(textStyleName);

          this.store.dispatch([
            new PebUpdateTextStyleAction(style, true),
            new PebUpdateAction(selected.map(elm => ({ id: elm.id, data: { textStyleName } }))),
          ]);
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}

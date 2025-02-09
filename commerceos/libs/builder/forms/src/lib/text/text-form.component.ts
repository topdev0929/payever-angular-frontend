import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { catchError, filter, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebUpdateTextStyleAction } from '@pe/builder/actions';
import { getGradientStyle, pebColorToCss } from '@pe/builder/color-utils';
import { 
  PEB_DEFAULT_FONT_COLOR_RGBA,
  PebDefaultTextStyles,
  PebGradientFill,
  PebTextJustify,
  PebTextStyles,
  PebTextVerticalAlign,
} from '@pe/builder/core';
import { PebSideBarService } from '@pe/builder/services';
import { PebEditorState, PebEditTextModel, PebSecondaryTab } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { defaultGradientFill } from '../background/const';
import { PebColorForm } from '../color';

import { PebFontListComponent } from './font-list.component';
import { PebTextFormService, toTextFormValue } from './text-form.service';

@Component({
  selector: 'peb-text-form',
  templateUrl: './text-form.component.html',
  styleUrls: ['./text-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebTextFormComponent {
  @Input() title = 'Font';
  textForm = this.formBuilder.group(toTextFormValue({ ...PebDefaultTextStyles, allowAutoWidth: false }));

  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  justify = PebTextJustify;
  align = PebTextVerticalAlign;

  textColor$ = this.textService.textStyles$.pipe(
    map(value => ({
      background: value.fill?.colorStops
        ? getGradientStyle(value.fill)
        : pebColorToCss(value.color),
    })),
  )

  isTextEditing$ = this.editText$.pipe(
    map(value => value.enabled),
  );

  private readonly submit$ = new BehaviorSubject(true);

  private readonly setTextForm$ = this.textService.textStyles$.pipe(
    tap((value) => {
      this.textForm.markAsPristine();
      this.textForm.patchValue(value);
    }),
  );

  private readonly textFormChanged$ = this.textForm.valueChanges.pipe(
    filter(() => this.textForm.dirty),
    tap(value => this.setFontWeight(value)),
    withLatestFrom(this.submit$),
    tap(([value, submit]) => {
      this.store.dispatch(new PebUpdateTextStyleAction(value, submit));
      this.textForm.markAsPristine();
    }),
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly destroy$: PeDestroyService,
    private readonly sideBarService: PebSideBarService,
    private readonly textService: PebTextFormService,
    private readonly store: Store,
  ) {
    merge(this.setTextForm$, this.textFormChanged$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }

  private setFontWeight(value: PebTextStyles & { bold: boolean }): void {
    value.fontWeight = value.fontWeight ?? (value.bold ? 700 : 400);
  }

  showFontsList() {
    const fontComponentRef = this.sideBarService.openDetail(PebFontListComponent, {
      backTitle: 'Style',
      title: 'Font Family',
    });
    const control = new FormControl();
    fontComponentRef.instance.formControl = control;
    const formValue = this.textForm.value;
    control.patchValue(formValue, { emitEvent: false });

    control.valueChanges.pipe(
      tap((value) => {
        this.submit$.next(true);
        this.patchTextFormValue(value);
      }),
      takeUntil(fontComponentRef.instance.destroy$),
    ).subscribe();
  }

  showTextColorForm() {
    const colorFormControl = new FormControl();
    const textColorControl = this.textForm.get('color');
    colorFormControl.patchValue(textColorControl.value ?? PEB_DEFAULT_FONT_COLOR_RGBA);

    const textFillControl = this.textForm.get('fill');
    const gradientForm = this.createGradientFormGroup(textFillControl.value);
    gradientForm.patchValue(textFillControl.value);

    const colorForm = this.sideBarService.openDetail(
      PebColorForm,
      { backTitle: 'Style', title: 'Color' },
    );

    colorForm.instance.enableGradient = true;
    colorForm.instance.formControl = colorFormControl;
    colorForm.instance.gradientForm = gradientForm;

    colorForm.instance.activeTab = textFillControl.value
      ? PebSecondaryTab.Gradient
      : PebSecondaryTab.Preset;

    const blurred$ = colorForm.instance.blurred.pipe(
      map(() => this.textForm.getRawValue()),
      tap((value) => {
        this.submit$.next(true);
        this.patchTextFormValue(value);
      }),
    );

    const gradientChanged$ = gradientForm.valueChanges.pipe(
      tap((value) => {
        this.submit$.next(false);
        this.patchTextFormValue({ fill: value });
      }),
    );

    const colorChanged$ = colorFormControl.valueChanges.pipe(
      tap((value) => {
        this.submit$.next(false);
        this.patchTextFormValue({ color: value, fill: null });
      }),
    );

    merge(gradientChanged$, colorChanged$, blurred$).pipe(
      takeUntil(colorForm.instance.destroy$),
    ).subscribe();
  }

  private patchTextFormValue(value: Partial<PebTextStyles>) {
    this.textForm.markAsDirty();
    this.textForm.patchValue(value);
  }

  private createGradientFormGroup(value: PebGradientFill): FormGroup {
    value = value ?? defaultGradientFill;
    const formGroup = this.formBuilder.group({
      angle: [value.angle ?? 90],
      colorStops: this.formBuilder.array([]),
    });

    const colorStopsArray = formGroup.get('colorStops') as FormArray;
    value.colorStops?.forEach((stop) => {
      const colorStopGroup = this.formBuilder.group({
        offset: [stop.offset],
        color: [{
          r: [stop.color.r],
          g: [stop.color.g],
          b: [stop.color.b],
          a: [1],
        }],
      });
      colorStopsArray.push(colorStopGroup);
    });
    formGroup.markAsPristine();

    return formGroup;
  }

  makeAutoWidth() {
    this.store.dispatch(new PebUpdateTextStyleAction({ fixedWidth: false }, true));
  }
}

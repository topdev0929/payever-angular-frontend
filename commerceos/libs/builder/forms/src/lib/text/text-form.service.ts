import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

import { PebDefaultTextStyles, PebScreen, PebTextJustify, PebTextStyles, PebTextVerticalAlign } from '@pe/builder/core';
import { extractElementTextStyles } from '@pe/builder/editor-utils';
import { isText, PebElement } from '@pe/builder/render-utils';
import { PebEditorState, PebEditTextModel, PebElementsState, PebOptionsState } from '@pe/builder/state';


@Injectable()
export class PebTextFormService {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebEditorState.editText) private readonly editText$!: Observable<PebEditTextModel>;
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;

  textStylesFromSelectedElements$ = this.selectedElements$.pipe(
    filter(elements => !!elements?.length),
    map((elements) => {
      const allowAutoWidth = elements.every(isText);
      const [element] = elements;
      const styles = {
        ...PebDefaultTextStyles,
        ...extractElementTextStyles(element),
        allowAutoWidth,
      };
      !isText(element) && (styles.fixedWidth = true);

      return toTextFormValue(styles);
    }),
  );

  textStylesFromEditor$ = this.editText$.pipe(
    filter(editText => editText?.enabled),
    map((editText) => {
      return toTextFormValue({
        ...PebDefaultTextStyles,
        ...editText.element?.styles.textStyles,
        ...editText.styles,
        allowAutoWidth: true,
      });
    })
  )

  textStyles$: Observable<any> = merge(
    this.textStylesFromSelectedElements$,
    this.textStylesFromEditor$,
  ).pipe(
    shareReplay(1)
  );
}

export function toTextFormValue(value: PebTextStyles & { allowAutoWidth: boolean }) {
  return {
    fontFamily: value.fontFamily ?? '',
    bold: value.fontWeight > 400,
    color: value.color ?? PebDefaultTextStyles.color,
    fontWeight: value.fontWeight ?? 400,
    italic: value.italic ?? false,
    underline: value.underline ?? false,
    strike: value.strike ?? false,
    fontSize: value.fontSize ?? PebDefaultTextStyles.fontSize,
    textJustify: value.textJustify ?? PebTextJustify.Center,
    verticalAlign: value.verticalAlign ?? PebTextVerticalAlign.Center,
    letterSpacing: value.letterSpacing ?? 'auto',
    lineHeight: value.lineHeight ?? 'auto',
    fixedWidth: value.fixedWidth,
    fixedHeight: value.fixedHeight,
    fill: value.fill ?? null,
    allowAutoWidth: value.allowAutoWidth,
  };
};


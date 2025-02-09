import { Injectable } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { PebScreen, PebBorder, PebBorderStyle, PEB_BORDER_COLOR } from '@pe/builder/core';
import { getBorderCssStyles, PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState, PebOptionsState, PebUpdateAction } from '@pe/builder/state';

import { PebBorderStyleFormComponent } from '../border-style/border-style-form.component';
import { PebColorForm } from '../color';

@Injectable({ providedIn: 'any' })
export class PebShapeBorderService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$: Observable<PebScreen>;

  public shapeBorderForm = this.formBuilder.group(
    {
      enabled: [true],
      width: 0,
      style: PebBorderStyle.Solid,
      color: [],
    },
    { updateOn: 'blur' },
  );

  defaultBorder: PebBorder = {
    enabled: false,
    width: 1,
    style: PebBorderStyle.Solid,
    color: PEB_BORDER_COLOR,
  };

  private selectedElements: any[];

  private changeForm$ = this.shapeBorderForm.valueChanges
    .pipe(
      filter(() => this.shapeBorderForm.dirty),
      tap((shapeBorder) => {
        this.shapeBorderForm.markAsPristine();
        this.checkAndSave(shapeBorder);
      }),
    );

  private selectedElement$ = this.selectedElements$.pipe(
    map((elements) => {

      this.selectedElements = elements;

      const checkedStyles = [
        { key: 'enabled', default: false },
        { key: 'width', default: 0 },
        { key: 'style', default: 'solid' },
        { key: 'color', default: 'inherit' },
      ];

      const styles = checkedStyles.map((checkedStyles) => {
        const value = this.selectedElements.reduce((acc: any, element) => {
          const styles = element.styles.border ? element.styles.border : this.defaultBorder;
          const style = styles[checkedStyles.key];

          return acc.includes(style) ? acc : [...acc, style];
        }, []);

        return {
          key: checkedStyles.key,
          value: value.length === 1 && !!value[0] ? value[0] : checkedStyles.default,
        };
      });

      const updateValue = styles.reduce((acc, style) => {
        acc[style.key] = style.value;

        return acc;
      }, {});

      this.shapeBorderForm.patchValue(updateValue, { emitEvent: true });

    }),
  );

  public initService$ = merge(this.changeForm$, this.selectedElement$);

  constructor(
    private store: Store,
    private readonly formBuilder: FormBuilder,
    private readonly sideBarService: PebSideBarService,
  ) {
  }

  openBorderStyleForm() {
    const borderFormCmpRef = this.sideBarService.openDetail(
      PebBorderStyleFormComponent,
      { backTitle: 'Back', title: 'Border style' },
    );
    borderFormCmpRef.instance.formControl = this.shapeBorderForm.get('style') as FormControl;
    borderFormCmpRef.instance.blurred.pipe(
      tap(() => {
        const styles = this.shapeBorderForm.getRawValue();
        this.checkAndSave(styles);
      }),
      takeUntil(borderFormCmpRef.instance.destroy$),
    ).subscribe();
  }

  showBorderColorForm() {
    const colorForm = this.sideBarService.openDetail(PebColorForm, { backTitle: 'Style', title: 'Border Color' },);
    colorForm.instance.formControl = this.shapeBorderForm.get('color') as FormControl;
  }

  isSingleLineBorder(value) {
    return ['solid', 'dashed'].includes(value);
  }

  private checkAndSave(shapeBorder: PebBorder) {
    this.saveElement(shapeBorder);
    this.updateLocalElement(shapeBorder);
  }

  private saveElement(border) {
    const payload = this.selectedElements.map(element => ({ id: element.id, styles: { border } }));
    this.store.dispatch(new PebUpdateAction(payload));
  }

  private updateLocalElement(styles): void {
    const payload = this.selectedElements.map((element) => {
      return {
        id: element.id,
        style: getBorderCssStyles(styles),
      };
    });

    this.store.dispatch(new PebViewPatchAction(payload));
  }
}

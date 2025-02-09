import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebColorForm } from '../color';


export enum PebGridElementBorderOption {
  None = 'none',
  OuterAll = 'outer-all',
  InnerAll = 'inner-all',
  All = 'all',
  OuterLeft = 'outer-left',
  InnerVertical = 'inner-vertical',
  OuterRight = 'outer-right',
  OuterTop = 'outer-top',
  InnerHorizontal = 'inner-horizontal',
  OuterBottom = 'outer-bottom',
}


@Component({
  selector: 'peb-grid-border-form',
  templateUrl: './grid-border.form.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './grid-border.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebGridBorderForm {

  @Select(PebElementsState.selected) private readonly selectedElements$: Observable<string[]>;

  readonly options: PebGridElementBorderOption[] = Object.values(PebGridElementBorderOption)
    .filter(option => option !== PebGridElementBorderOption.None);

  readonly formGroup: FormGroup = this.fb.group({
    color: ['#000000'],
    width: [1],
    options: this.fb.group(this.options.reduce((acc, option) => {
      acc[option] = [false];

      return acc;
    }, {})),
  });

  readonly borderColor$: Observable<{ backgroundColor: string }>;

  constructor(
    private sideBarService: PebSideBarService,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    this.options.forEach((opt) => {
      matIconRegistry.addSvgIcon(
        `grid-border-${opt}`,
        domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/borders/${opt}.svg`),
      );
    });
  }

  showBorderColorForm() {
    const colorFormCmpRef = this.sideBarService.openDetail(
      PebColorForm,
      { backTitle: 'Style', title: 'Border Color' },
    );
    const value = this.formGroup.get('color').value;
    const control = new FormControl(value);

    colorFormCmpRef.instance.formControl = control;
    colorFormCmpRef.instance.blurred.pipe(
      tap(() => {
        this.formGroup.get('color').patchValue(control.value);
      }),
      takeUntil(colorFormCmpRef.instance.destroy$),
    ).subscribe();
  }
}

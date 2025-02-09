import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { getNormalizedKey } from '@pe/builder/render-utils';
import { PebEditorState, PebUpdateThemeScreens } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

@Component({
  selector: 'peb-screens-dialog',
  templateUrl: './screens-dialog.component.html',
  styleUrls: ['./screens-dialog.component.scss'],
  providers: [PeDestroyService],
})
export class PebScreensDialogComponent implements OnInit {
  @Select(PebEditorState.screens) screens$!: Observable<PebScreen[]>;

  formGroup = this.fb.group({ screens: this.fb.array([]) });

  minScreenWidth = 260;

  get screens(): FormArray {
    return this.formGroup.controls.screens as FormArray;
  }

  constructor(
    private dialogRef: MatDialogRef<PebScreensDialogComponent>,
    private fb: FormBuilder,
    private destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.formGroup.setValidators(this.createSameTitleAndWidthValidator());

    this.screens$
      .pipe(
        takeUntil(this.destroy$),
        tap((screens) => {
          this.screens.clear();
          let cnt = 0;
          for (const screen of screens) {
            const formGroup = this.getScreenFormGroup();
            this.screens.push(formGroup);

            this.screens.at(cnt)?.patchValue({ ...screen, order: cnt });
            cnt++;
          }
          this.sortScreenForm();
        }),
      )
      .subscribe();
  }

  addBreakpoint() {
    const newBreakpoint = this.getScreenFormGroup();
    this.screens.push(newBreakpoint);
    this.sortScreenForm();
  }

  deleteBreakpoint(index: number) {
    if (index > -1) {
      this.screens.removeAt(index);
    }
  }

  private getScreenFormGroup(): FormGroup {
    return this.fb.group({
      key: this.fb.control(''),
      title: this.fb.control('Breakpoint', [Validators.required]),
      width: this.fb.control(this.minScreenWidth, [Validators.required, Validators.min(this.minScreenWidth)]),
      padding: this.fb.control(0, [Validators.required, Validators.min(0)]),
      icon: this.fb.control('mobile', [Validators.required]),
    });
  }

  widthChanged(formGroup: FormGroup): void {
    const width = formGroup.value.width;
    formGroup.get('icon')?.patchValue(this.getIconByWidth(width));
    this.sortScreenForm();
  }

  submit(): void {
    if (this.formGroup.valid && this.screens.length) {
      const result = this.formGroup.getRawValue();
      const newScreens: PebScreen[] = result.screens;
      this.setKeyToScreens(newScreens);

      this.store.dispatch(new PebUpdateThemeScreens(newScreens));
      this.dialogRef.close();
    } else {
      this.showError();
    }
  }

  private showError(): void {
    const repeatedFields = [];

    if (this.formGroup.errors?.repeatedTitle) {
      repeatedFields.push('Title');
    }

    if (this.formGroup.errors?.repeatedWidth) {
      repeatedFields.push('Width');
    }

    if (repeatedFields.length) {
      this.snackbarService.toggle(true, {
        content: `Same ${repeatedFields.join(' and ')} is not valid.`,
        duration: 2000,
        iconId: 'icon-commerceos-error',
      });
    }
  }

  private setKeyToScreens(screens: PebScreen[]): void {
    const keys = new Set(screens.filter(screen => screen).map(screen => screen.key));
    for (const screen of screens) {
      if (!screen.key) {
        let key = getNormalizedKey(screen.title);

        let exists = keys.has(key);
        while (exists) {
          key += '-' + (Math.random() + 1).toString(36).substring(2, 6);
          exists = keys.has(key);
        }

        screen.key = key;
      }
    }
  }

  private sortScreenForm() {
    this.screens.patchValue(this.screens.value.sort((a: any, b: any) => b.width - a.width));
  }

  private getIconByWidth(width: number): string {
    if (width <= 360) {
      return 'mobile';
    }
    if (width <= 768) {
      return 'tablet';
    }
    
    return 'desktop';
  }

  private createSameTitleAndWidthValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const screens = formGroup.controls.screens as FormArray;

      const titles = new Set(screens.value.map((screen: PebScreen) => getNormalizedKey(screen.title)));
      const width = new Set(screens.value.map((screen: PebScreen) => screen.width));

      let error: ValidationErrors | null = {};

      if (titles.size !== screens.length) {
        error.repeatedTitle = true;
      }

      if (width.size !== screens.length) {
        error.repeatedWidth = true;
      }

      return error;
    };
  }

  close(): void {
    this.dialogRef.close();
  }
}

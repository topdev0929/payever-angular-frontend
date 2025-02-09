import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { PebPageVariant } from '@pe/builder/core';
import { PageVariants } from '@pe/builder/old';
import { PeDestroyService } from '@pe/common';

import { PebPageFormService } from './page-form.service';


@Component({
  selector: 'peb-page-form',
  templateUrl: './page-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './page-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebPageFormComponent implements OnInit {

  readonly pageVariants: typeof PageVariants = PageVariants;

  isMasterPage$ = this.pageFormService.activePage$.pipe(map(page => page?.isMaster ?? false));
  masterPages$ = this.pageFormService.masterPages$;
  parents$ = this.pageFormService.parents$;
  languages$ = this.pageFormService.languages$;

  form = new FormGroup({
    frontPage: new FormControl(true),
    name: new FormControl('Blank page'),
    variant: new FormControl(PebPageVariant.Front),
    url: new FormControl('/', { validators: [linkValidator()] }),
    masterPage: new FormControl(''),
    parentId: new FormControl(''),
    defaultLanguage: new FormControl(''),
  });

  canChangeType$: Observable<boolean> = this.pageFormService.activePage$.pipe(
    map(({ frontPage }) => !frontPage),
  );

  constructor(
    private readonly pageFormService: PebPageFormService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.pageFormService.activePage$.pipe(
      tap((value) => {
        if (value.frontPage) {
          value.url = '/';
          this.form.get('url').disable({ emitEvent: false });
          this.form.get('variant').disable({ emitEvent: false });
        } else {
          this.form.get('url').enable({ emitEvent: false });
          this.form.get('variant').enable({ emitEvent: false });
        }

        this.form.patchValue(value, { emitEvent: false });
        this.form.markAsPristine();
        this.form.markAsUntouched();
      }),
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();

    this.form.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap((value) => {
        this.pageFormService.updatePage(value);
      }),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }
}

const linkValidator = (): ValidatorFn => {
  return (control: AbstractControl) => {
    return /^\/(([\w/:%._+~#=-])*[\w:%._+~#=-])?$/.test(control.value) ? null : { link: true };
  };
};

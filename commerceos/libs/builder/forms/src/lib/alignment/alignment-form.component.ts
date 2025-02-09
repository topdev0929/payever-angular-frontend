import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { SelectOption } from '@pe/builder/core';
import { ALIGN_TYPES } from '@pe/builder/old';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebAlignmentFormService } from './alignment-form.service';

@Component({
  selector: 'peb-alignment-form',
  templateUrl: './alignment-form.component.html',
  styleUrls: ['./alignment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebAlignmentForm {
  
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  alignTypes: SelectOption[][] = ALIGN_TYPES;

  alignmentForm = this.formBuilder.group({ align: null });

  constructor(
    private readonly alignmentFormService: PebAlignmentFormService,
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      tap(() => this.alignmentForm.patchValue({ align: null }, { emitEvent: false })),
      takeUntil(this.destroy$),
    ).subscribe();

    this.alignmentForm.valueChanges.pipe(
      filter(align => !!align),
      tap(({ align }) => this.alignmentFormService.setAlignment(align)),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}

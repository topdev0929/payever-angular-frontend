import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PebShapeBorderService } from './shape-border-form.service';

@Component({
  selector: 'peb-shape-border',
  templateUrl: './shape-border-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './shape-border-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebShapeBorderFormComponent {

  public borderColor$ = this.shapeBorderService.shapeBorderForm.get('color').valueChanges.pipe(
    startWith(''),
    map(() => this.shapeBorderService.shapeBorderForm.get('color').value)
  );

  constructor(
    public shapeBorderService: PebShapeBorderService,
    private destroy$: PeDestroyService,
  ) {
    this.shapeBorderService.initService$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

}

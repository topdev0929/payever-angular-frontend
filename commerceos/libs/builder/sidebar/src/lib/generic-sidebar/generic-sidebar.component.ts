import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { pairwise, startWith, takeUntil, tap } from 'rxjs/operators';

import { PebElementType } from '@pe/builder/core';
import { PebBackgroundForm, PebBackgroundFormService } from '@pe/builder/forms';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-generic-sidebar',
  templateUrl: './generic-sidebar.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
  ],
  providers: [
    PeDestroyService,
  ],
})
export class PebGenericSidebarComponent implements OnDestroy, OnInit {

  @Select(PebElementsState.selected) selectedElements$!: Observable<PebElement[]>;

  background$ = this.backgroundFormService.preview$;

  backgroundForm = this.backgroundFormService.backgroundForm;

  hasGrid = false;
  hasSection = false;
  hasShape = false;
  hasText = false;

  constructor(
    private readonly backgroundFormService: PebBackgroundFormService,
    private readonly sideBarService: PebSideBarService,
    private readonly destroy$: PeDestroyService,
    private readonly store: Store,
  ) {
  }

  ngOnInit(): void {
    this.backgroundFormService.init();

    this.selectedElements$.pipe(
      startWith(null),
      pairwise(),
      tap(([prev, curr]) => {
        this.hasGrid = curr.some(elm => elm.type === PebElementType.Grid);
        this.hasSection = curr.some(elm => elm.type === PebElementType.Section);
        this.hasShape = curr.some(elm => elm.type === PebElementType.Shape);
        this.hasText = curr.some(elm => elm.type === PebElementType.Text);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.backgroundFormService.destroy$.next();
  }

  onSubmit() {
    this.backgroundFormService.submit$.next(true);
  }

  showBackgroundForm() {
    this.sideBarService.openDetail(PebBackgroundForm, { backTitle: 'Style', title: 'Fill' });
  }
}

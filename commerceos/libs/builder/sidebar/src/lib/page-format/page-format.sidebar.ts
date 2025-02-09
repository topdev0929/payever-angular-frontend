import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PebBackgroundForm, PebBackgroundFormService } from '@pe/builder/forms';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';

@Component({
  selector: 'peb-editor-page-sidebar-format',
  templateUrl: 'page-format.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './page-format.sidebar.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorPageSidebarFormatComponent implements OnInit, OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  @Input() page: any;
  @Input() application: any;

  private readonly destroy$ = new Subject<void>();

  background$ = this.backgroundFormService.preview$;

  constructor(
    private sideBarService: PebSideBarService,
    private backgroundFormService: PebBackgroundFormService,
  ) {
  }

  ngOnInit(): void {
    this.backgroundFormService.init();
    this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      tap(([element]) => {
        this.backgroundFormService.activeMediaType$.next(element.styles.mediaType);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  showBackgroundForm() {
    this.sideBarService.openDetail(PebBackgroundForm, { backTitle: 'Style', title: 'Fill' });
  }

  ngOnDestroy(): void {
    this.backgroundFormService.destroy$.next();
    this.destroy$.next();
  }

}

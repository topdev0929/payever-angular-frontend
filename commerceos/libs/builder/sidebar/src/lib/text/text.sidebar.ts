import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { isGridLayout, MediaType } from '@pe/builder/core';
import { PebBackgroundForm, PebBackgroundFormService } from '@pe/builder/forms';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState, PebSecondaryTab } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-editor-text-sidebar',
  templateUrl: 'text.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './text.sidebar.scss',
  ],
  providers: [PeDestroyService],
})
export class PebEditorTextSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  activeTab = PebSecondaryTab.Text;

  editMode$: Observable<boolean>;

  background$ = this.backgroundFormService.preview$;

  backgroundForm = this.backgroundFormService.backgroundForm;
  
  showLayoutIndexForm$ = this.selectedElements$.pipe(
    filter(elements => !!elements?.length),
    map(([elm]) => isGridLayout(elm.parent?.styles.layout))
  );

  constructor(
    private destroy$: PeDestroyService,
    private readonly sideBarService: PebSideBarService,
    private readonly backgroundFormService: PebBackgroundFormService,
  ) {
  }

  get showTextForm() {   
    return true;
  }

  ngOnInit(): void {
    this.backgroundFormService.init();
    this.selectedElements$.pipe(
      filter(elements => !!elements?.length),
      tap(([element]) => {
        this.backgroundFormService.activeMediaType$.next(element.styles.mediaType);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  showBackgroundForm() {
    const backgroundFormCmpRef = this.sideBarService.openDetail(
      PebBackgroundForm,
      { backTitle: 'Style', title: 'Fill' },
    );
    backgroundFormCmpRef.instance.mediaTypes = [
      { name: 'No media', value: MediaType.None },
      { name: 'Image', value: MediaType.Image },
      { name: 'payever Studio', value: MediaType.Studio },
    ];
  }

  onSubmit() {
    this.backgroundFormService.submit$.next(true);
  }

  ngOnDestroy(): void {
    this.backgroundFormService.destroy$.next();
  }
}

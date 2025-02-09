import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PebLanguage } from '@pe/builder/core';
import { PebOptionsState, PebSetLanguageAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-editor-languages-dialog',
  templateUrl: './languages.dialog.html',
  styleUrls: ['./languages.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebEditorLanguagesDialog implements OnInit {

  @Select(PebOptionsState.language) language$!: Observable<PebLanguage>;

  languages: any; // = this.editorStore.availableLanguages;

  selectedLanguage: PebLanguage;

  constructor(
    private dialogRef: MatDialogRef<PebEditorLanguagesDialog>,
    private store: Store,
    private destroy$: PeDestroyService,
  ) {
    this.language$.pipe(
      tap((language) => {
        this.selectedLanguage = language;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().pipe(
      filter(result => !!result),
      tap(() => {
        this.store.dispatch(new PebSetLanguageAction(this.selectedLanguage));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  setLanguage(language: PebLanguage): void {
    this.selectedLanguage = language;
  }

  done(): void {
    if (this.selectedLanguage) {
      this.store.dispatch(new PebSetLanguageAction(this.selectedLanguage));
    }

    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

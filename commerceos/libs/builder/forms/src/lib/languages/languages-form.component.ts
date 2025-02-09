import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PebLanguage, PebThemeLanguageSetting } from '@pe/builder/core';
import { PebEditorState, PebOptionsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebLanguageFormService } from './languages-form.service';

@Component({
  selector: 'peb-languages-form',
  templateUrl: './languages-form.component.html',
  styleUrls: ['./languages-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PebLanguageFormService,
    PeDestroyService,
  ],
})
export class PebLanguagesFormComponent implements OnInit {
  @Select(PebEditorState.languageSetting) private readonly languageSetting$!: Observable<PebThemeLanguageSetting>;
  @Select(PebOptionsState.language) private readonly editorLanguage$!: Observable<PebLanguage>;

  constructor(
    private destroy$: PeDestroyService,
    public languageFormService: PebLanguageFormService,
  ) {
    languageFormService.initService$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
    combineLatest([this.languageSetting$, this.editorLanguage$]).pipe(
      tap(([language, editorLanguage]) => {
        this.languageFormService.setCurrentLanguages(language.languages ? Object.values(language.languages) : []);

        this.languageFormService.languageForm.patchValue({
          defaultLanguage: language.defaultLanguage?.key,
          editorLanguage: editorLanguage?.key,
        });

        this.languageFormService.languageForm.markAsUntouched();
        this.languageFormService.languageForm.markAsPristine();
      }),
      take(1),
    ).subscribe();
  }
}

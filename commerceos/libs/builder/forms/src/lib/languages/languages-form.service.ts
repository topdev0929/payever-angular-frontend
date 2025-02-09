import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { filter, map, shareReplay, take, takeUntil, tap } from 'rxjs/operators';

import { PebLanguage, SelectOption } from '@pe/builder/core';
import { PebSetLanguageAction, PebSetThemeLanguages } from '@pe/builder/state';
import { PE_ENV, PeDestroyService } from '@pe/common';

@Injectable()
export class PebLanguageFormService {
  allLanguages$!: Observable<PebLanguage[]>;
  languages$!: Observable<SelectOption[]>;

  constructor(
    @Inject(PE_ENV) private env,
    private readonly formBuilder: FormBuilder,
    private readonly http: HttpClient,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
  ) {
    this.allLanguages$ = this.http.get<PebLanguage[]>(`${this.env.backend.builderShop}/api/language`).pipe(shareReplay());

    this.fillLanguages();
  }

  languageForm: FormGroup = this.formBuilder.group({
    autoDetect: [false],
    languages: this.formBuilder.array([]),
    languageToAdd: [null],
    defaultLanguage: [''],
    editorLanguage: [''],
  });

  private changeForm$ = merge(
    this.getFormControl('languages').valueChanges,
    this.getFormControl('defaultLanguage').valueChanges,
    this.getFormControl('autoDetect').valueChanges,
  ).pipe(
    filter(() => this.languageForm.dirty),
    tap(() => this.saveLanguages()),
  );

  private editorLanguage$ = this.getFormControl('editorLanguage').valueChanges.pipe(
    filter(() => this.languageForm.dirty),
    tap(() => this.saveEditorLanguage()),
    takeUntil(this.destroy$),
  );

  public initService$ = merge(this.changeForm$, this.editorLanguage$);

  fillLanguages() {
    const languagesArray = this.getFormControl('languages') as FormArray;

    this.languages$ = this.allLanguages$.pipe(
      map(languages => languages
        .filter(language => !languagesArray.value.some(lang => lang.key === language.key))
        .map(language => ({ name: language.title, value: language }))
      ),
      shareReplay(),
    );
  }

  get languagesControl(): FormArray {
    return this.languageForm.controls.languages as FormArray;
  }


  get activeLanguageOptions(): PebLanguage[] {
    return this.languagesControl.value
      .filter(lang => lang.active)
      .map((lang: PebLanguage) => {
        return {
          value: lang.key,
          name: lang.title,
        };
      });
  }

  private getFormControl(control: string): AbstractControl {
    return this.languageForm.get(control);
  }

  newLanguage(language: PebLanguage, active: boolean = true) {
    return this.formBuilder.group({
      ...language,
      active,
    });
  }

  setCurrentLanguages(languages: PebLanguage[]): void {
    const languagesArray = this.getFormControl('languages') as FormArray;
    languagesArray.clear();
    languages.forEach(language => languagesArray.push(this.newLanguage(language, language.active)));

    this.fillLanguages();
  }

  addLanguage() {
    const newLanguageValue = this.getFormControl('languageToAdd').value;

    if (newLanguageValue && !this.languageExists(newLanguageValue)) {
      const languagesArray = this.getFormControl('languages') as FormArray;
      languagesArray.push(this.newLanguage(newLanguageValue));
      this.getFormControl('languageToAdd').setValue(null);
      this.fillLanguages();
    }
  }

  private languageExists(language: string): boolean {
    const languagesArray = this.getFormControl('languages') as FormArray;

    return languagesArray.value.some((lang: { language: string }) => lang.language === language);
  }

  private saveLanguages() {
    const formValue = this.languageForm.getRawValue();

    this.findLanguage(formValue.defaultLanguage).pipe(
      tap(defaultLanguage => this.store.dispatch(new PebSetThemeLanguages({ ...formValue, defaultLanguage }))),
      take(1),
    ).subscribe();
  }

  private saveEditorLanguage() {
    const formValue = this.languageForm.getRawValue();

    this.findLanguage(formValue.editorLanguage).pipe(
      tap(language => this.store.dispatch(new PebSetLanguageAction(language))),
      take(1),
    ).subscribe();
  }

  private findLanguage(key: string): Observable<PebLanguage> {
    return this.allLanguages$.pipe(
      map(languages => languages.find(lang => lang.key === key)),
    );
  }

}

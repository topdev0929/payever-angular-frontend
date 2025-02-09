import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { Validators } from "@angular/forms";
import { takeUntil, tap } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { SeoSection } from '../../../../shared/interfaces/section.interface';
import { SectionsService } from '../../../services';

const MAX_LENGTH = 55;

@Component({
  selector: 'seo-section',
  templateUrl: 'editor-seo-section.component.html',
  styleUrls: ['editor-seo-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})

export class EditorSeoSectionComponent extends FormAbstractComponent<SeoSection> implements OnInit {
  readonly section: ProductEditorSections = ProductEditorSections.SEO;
  seoSection: SeoSection = this.sectionsService.seoSection;
  formScheme: FormScheme;
  formTranslationsScope = 'seoSection.form';

  protected formStorageKey = 'seoSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private readonly translateService: TranslateService,
    private sectionsService: SectionsService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.sectionsService.saveClicked$.pipe(
      tap(() => {
        this.doSubmit();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  protected createForm(initialData: SeoSection): void {
    const data: SeoSection =  this.sectionsService.seoSection;

    this.form = this.formBuilder.group({
      title: [data.title, Validators.maxLength(MAX_LENGTH)],
      description: [data.description],
    });

    this.changeDetectorRef.detectChanges();
  }

  get titleErrorMessage() {
    return this.translateService.translate('seoSection.errors.title_max_length', {
      length: MAX_LENGTH,
    })
  }

  protected onUpdateFormData(formValues: SeoSection): void {
    this.sectionsService.onChangeSeoSection(this.form.getRawValue());
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}

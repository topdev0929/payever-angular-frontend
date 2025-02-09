import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { Subject } from 'rxjs';

import { ErrorBag, FormAbstractComponent, FormScheme, SlideToggleLabelPosition, SlideToggleSize } from '@pe/forms';

import { SectionsService } from '../../../services';
import { ExternalError, VisibilitySection } from '../../../../shared/interfaces/section.interface';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';

@Component({
  selector: 'visibility-section',
  templateUrl: 'editor-visibility-section.component.html',
  styleUrls: ['editor-visibility-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorVisibilitySectionComponent extends FormAbstractComponent<VisibilitySection> {
  @Input() externalError: Subject<ExternalError>;

  readonly section: ProductEditorSections = ProductEditorSections.Visibility;
  visibilitySection: VisibilitySection = this.sectionsService.visibilitySection;
  formScheme: FormScheme;
  formTranslationsScope = 'visibilitySection.form';

  protected formStorageKey = 'visibilitySection.form';

  constructor(injector: Injector, protected errorBag: ErrorBag, private sectionsService: SectionsService) {
    super(injector);
  }

  protected createForm(initialData: VisibilitySection): void {
    const data: VisibilitySection = this.visibilitySection;
    this.form = this.formBuilder.group({
      active: [data.active],
    });

    this.formScheme = {
      fieldsets: {
        visibilitySection: [
          {
            name: 'active',
            type: 'slide-toggle',
            fieldSettings: {
              classList: 'col-xs-12 label-white',
              label: 'Show this product',
            },
            slideToggleSettings: {
              fullWidth: true,
              labelPosition: SlideToggleLabelPosition.Before,
              size: SlideToggleSize.Default,
            },
          },
        ],
      },
    };

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: VisibilitySection): void {
    this.sectionsService.onChangeVisibilitySection(formValues);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}

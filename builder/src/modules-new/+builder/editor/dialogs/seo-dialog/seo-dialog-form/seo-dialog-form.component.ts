import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { isEqual } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';

import { FormAbstractComponent, FormFieldType, FormScheme } from '@pe/ng-kit/modules/form';
import { SlideToggleLabelPosition } from '@pe/ng-kit/modules/form-components-slide-toggle';
import { SeoFormInputs } from '../seo-dialog.component';

enum Tabs {
  General = 'general',
  Advanced = 'advanced',
}

@Component({
  selector: 'pe-builder-seo-dialog-form',
  templateUrl: 'seo-dialog-form.component.html',
  styleUrls: ['seo-dialog-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoDialogFormComponent extends FormAbstractComponent<SeoFormInputs> {
  @Input()
  set initialData(value: SeoFormInputs) {
    this.initialDataSubject$.next(value);
    this.updateForm();
  }

  @Output()
  changed: EventEmitter<SeoFormInputs> = new EventEmitter();

  selectedTab = Tabs.General;

  formScheme: FormScheme;

  private readonly initialDataSubject$ = new BehaviorSubject<SeoFormInputs>({
    title: null,
    url: null,
    description: null,
    showInSearchResults: null,
    canonical: null,
    markup: null,
    tags: null,
  });

  selectGeneral(): void {
    this.selectedTab = Tabs.General;
  }

  selectAdvanced(): void {
    this.selectedTab = Tabs.Advanced;
  }

  get isGeneral(): boolean {
    return this.selectedTab === Tabs.General;
  }

  protected createForm(): void {
    this.formScheme = {
      fieldsets: {
        seoInput: [
          {
            name: 'title',
            type: FormFieldType.Input,
            fieldSettings: {
              classList: 'seo-input',
              label: 'rer',
            },
            inputSettings: {
              placeholder: 'Title',
              minLength: 400,
            },
          },
          {
            name: 'url',
            type: FormFieldType.Input,
            fieldSettings: {
              classList: 'seo-input',
              label: 'rer',
            },
            inputSettings: {
              placeholder: 'URL',
            },
          },
          {
            name: 'description',
            type: FormFieldType.Textarea,
            fieldSettings: {
              classList: 'seo-input',
              label: 'rer',
            },
            textareaSettings: {
              placeholder: 'Description',
            },
          },
          {
            name: 'showInSearchResults',
            type: FormFieldType.SlideToggle,
            fieldSettings: {
              classList: 'seo-input',
              label: 'Show in search results',
            },
            inputSettings: {
              placeholder: 'Placeholder',
            },
            slideToggleSettings: {
              labelPosition: SlideToggleLabelPosition.Before,
              fullWidth: true,
            },
          },
        ],
        advanced: [
          {
            name: 'canonical',
            type: FormFieldType.Input,
            fieldSettings: {
              classList: 'seo-input',
              label: 'rer',
            },
            inputSettings: {
              placeholder: 'Canonical',
            },
          },
          {
            name: 'markup',
            type: FormFieldType.Textarea,
            fieldSettings: {
              classList: 'seo-input',
              label: 'rer',
            },
            textareaSettings: {
              placeholder: 'Markup',
            },
          },
          {
            name: 'tags',
            type: FormFieldType.Textarea,
            fieldSettings: {
              classList: 'seo-input',
              label: 'rer',
            },
            textareaSettings: {
              placeholder: 'Custom meta tags',
            },
          },
        ],
      },
    };
    this.form = this.formBuilder.group(this.initialDataSubject$.value);

    this.changeDetectorRef.detectChanges();
  }

  protected updateForm(): void {
    if (this.form) {
      this.form.patchValue({
        ...this.initialDataSubject$.value,
      });
    }
  }

  // tslint:disable-next-line:no-empty
  protected onSuccess(): void {}

  protected onUpdateFormData(): void {
    const noChanges = isEqual(this.form.value, this.initialDataSubject$.value);
    if (noChanges) {
      return;
    }

    this.changed.emit(this.form.value);
  }
}

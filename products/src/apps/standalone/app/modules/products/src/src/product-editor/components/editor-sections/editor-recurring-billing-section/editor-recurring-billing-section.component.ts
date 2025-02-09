import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  FormFieldType,
  FormScheme,
  InputType,
  SlideToggleLabelPosition,
  SlideToggleSize,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { SectionsService } from '../../../services';
import { RecurringBillingFormInterface } from '../../../../shared/interfaces/billing.interface';
import { ExternalError } from '../../../../shared/interfaces/section.interface';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';

@Component({
  selector: 'recurring-billing-section',
  templateUrl: 'editor-recurring-billing-section.component.html',
  styleUrls: ['editor-recurring-billing-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorRecurringBillingSectionComponent extends FormAbstractComponent<RecurringBillingFormInterface> {
  @Input() externalError: Subject<ExternalError>;

  readonly section: ProductEditorSections = ProductEditorSections.Visibility;
  recurringBillingSection: RecurringBillingFormInterface;
  formScheme: FormScheme;
  formTranslationsScope = 'recurringBillingSection.form';
  isLoadingData$ = this.sectionsService.recurringBillingLoading$.asObservable();

  protected formStorageKey = 'recurringBillingSection.form';
  private options = [
    { label: this.translateService.translate(`${this.formTranslationsScope}.interval.options.day`), value: 'day' },
    { label: this.translateService.translate(`${this.formTranslationsScope}.interval.options.week`), value: 'week' },
    { label: this.translateService.translate(`${this.formTranslationsScope}.interval.options.month`), value: 'month' },
    { label: this.translateService.translate(`${this.formTranslationsScope}.interval.options.year`), value: 'year' },
  ];

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private sectionsService: SectionsService,
    private translateService: TranslateService,
  ) {
    super(injector);
  }

  get isAvailable(): boolean {
    return this.sectionsService.isRecurringBillingAvailable();
  }

  protected createForm(initialData: RecurringBillingFormInterface): void {
    this.isLoadingData$.pipe(filter(d => !d), take(1)).subscribe(() => {
      this.recurringBillingSection = this.sectionsService.recurringBilling;
      const data: RecurringBillingFormInterface = this.recurringBillingSection;
      this.form = this.formBuilder.group({
        enabled: [data.enabled],
        interval: [data.interval || this.options[2].value, [Validators.required]],
        billingPeriod: [data.billingPeriod || 1, [Validators.required]],
      });

      this.formScheme = {
        fieldsets: {
          recurringBillingSection: [
            {
              name: 'enabled',
              type: FormFieldType.SlideToggle,
              fieldSettings: {
                classList: 'col-xs-12 label-white',
              },
              slideToggleSettings: {
                fullWidth: true,
                labelPosition: SlideToggleLabelPosition.Before,
                size: SlideToggleSize.Default,
              },
            },
            {
              name: 'billingPeriod',
              type: FormFieldType.Input,
              inputSettings: {
                type: InputType.Number,
                numberMin: 1,
                numberMax: 10000000,
                numberIsInteger: true,
              },
              fieldSettings: {
                classList: 'col-xs-12',
                required: true,
              },
            },
            {
              name: 'interval',
              type: FormFieldType.Select,
              fieldSettings: {
                classList: 'col-xs-12',
              },
              selectSettings: {
                options: this.options,
                panelClass: 'mat-select-dark',
              },
            },
          ],
        },
      };
      this.changeDetectorRef.detectChanges();
    });
  }

  protected onUpdateFormData(formValues: RecurringBillingFormInterface): void {
    this.sectionsService.onChangeRecurringBillingSection(formValues);

    this.toggleControl('interval', formValues.enabled);
    this.toggleControl('billingPeriod', formValues.enabled);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}

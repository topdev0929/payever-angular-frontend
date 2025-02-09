import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { ErrorBag, FormAbstractComponent, FormScheme, SelectOptionInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { SectionsService } from '../../../services';
import { ExternalError, TaxesSection, VatRateInterface } from '../../../../shared/interfaces/section.interface';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'taxes-section',
  templateUrl: 'editor-taxes-section.component.html',
  styleUrls: ['editor-taxes-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorTaxesSectionComponent extends FormAbstractComponent<TaxesSection> implements OnInit {
  @Input() externalError: Subject<ExternalError>;

  readonly section: ProductEditorSections = ProductEditorSections.Taxes;
  taxesSection: TaxesSection = this.sectionsService.taxesSection;
  formScheme: FormScheme;
  formTranslationsScope = 'taxesSection.form';
  ratesOptions: SelectOptionInterface[] = [];

  protected formStorageKey = 'taxesSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private sectionsService: SectionsService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    const ratesList: VatRateInterface[] = this.route.snapshot.data.vatRates;

    this.ratesOptions = ratesList.map(rate => {
      return {
        label: `${rate.description} ${rate.rate}%`,
        value: rate.rate,
      };
    });
  }

  protected createForm(initialData: TaxesSection): void {
    const data: TaxesSection = this.sectionsService.taxesSection;

    this.form = this.formBuilder.group({
      vatRate: [data.vatRate || this.ratesOptions[0].value],
    });

    this.formScheme = {
      fieldsets: {
        taxesSection: [
          {
            name: 'vatRate',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-12',
              label: this.translateService.translate('taxesSection.form.tax.label'),
            },
            selectSettings: {
              options: this.ratesOptions,
              panelClass: 'mat-select-dark',
            },
          },
        ],
      },
    };

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: TaxesSection): void {
    this.sectionsService.onChangeTaxesSection(formValues);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}

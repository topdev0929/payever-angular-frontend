import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { merge, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ColorPickerFormat, ErrorBag, FormAbstractComponent, FormScheme } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { ChannelTypes, ProductEditorSections } from '../../../../shared/enums/product.enum';
import { AttributesSection, AttributeTypesEnum } from '../../../../shared/interfaces/section.interface';
import { AttribuiteApiService, SectionsService } from '../../../services';
import { LanguageService } from '../../../services/language.service';
import { channelsWithDynamicAttributes } from '../editor-config';

@Component({
  selector: 'attributes-section',
  templateUrl: 'editor-attributes-section.component.html',
  styleUrls: ['editor-attributes-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorAttributesSectionComponent extends FormAbstractComponent<AttributesSection> implements OnInit {

  attributeTypeOptions: Array<{ label: string; value: AttributeTypesEnum }> = [];

  colorPickerFormat = ColorPickerFormat;
  loadedAttributes = false;

  formScheme: FormScheme;
  protected formStorageKey = 'attributessection.form';
  readonly section: ProductEditorSections = ProductEditorSections.Attributes;

  get attributesForm(): FormArray {
    return this.form?.get('attributes') as FormArray;
  }

  constructor(
    injector: Injector,
    private sectionsService: SectionsService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private attributeService: AttribuiteApiService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.attributeTypeOptions = Object.keys(AttributeTypesEnum).map((key: AttributeTypesEnum) => {
      return {
        label: this.translateService.translate(`attributeType.${AttributeTypesEnum[key]}`),
        value: AttributeTypesEnum[key],
      };
    });

    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap(() => {
          const attributes = this.sectionsService.attributesSection;
          this.attributesForm.clear();

          attributes.forEach((attribute) => {
            this.addAttribute(attribute);
          });

          this.changeDetectorRef.detectChanges();
        })
      ),
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.sectionsService.channelSetsCategories$.pipe(
      debounceTime(300),
      map((channelSetCategories) => {
        const channelWithDynamicAttributes = channelSetCategories.find(
          channelSetCategory => channelsWithDynamicAttributes.includes(
            channelSetCategory.channelSetType as ChannelTypes,
          ),
        );

        return channelWithDynamicAttributes?.categories?.[0]?.title;
      }),
      filter(category => !!category),
      distinctUntilChanged(),
      switchMap(category => this.loadAttributesFromService(category)),
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  addAttribute(attribute?): void {
    attribute = attribute || { type: AttributeTypesEnum.text, name: '', value: '' };
    const attributeRegex: RegExp = /^[^-\s].*/;
    this.attributesForm.push(
      this.formBuilder.group({
        type: [attribute.type, [Validators.required, Validators.pattern(attributeRegex)]],
        name: [attribute.name, [Validators.required, Validators.pattern(attributeRegex)]],
        value: [attribute.value, [Validators.required, Validators.pattern(attributeRegex)]],
      }),
    );
  }

  removeAttribute(index: number): void {
    this.attributesForm.removeAt(index);
  }

  loadAttributesFromService(category: string): Observable<void> {
    return this.attributeService.getSchema(category, channelsWithDynamicAttributes).pipe(
      map((res: any[]) => {
        if (!this.loadedAttributes && this.attributesForm.value?.length) {
          this.loadedAttributes = true;

          return null;
        }

        this.loadedAttributes = true;

        const attributes = res.map((schemaItem) => {
          if (!Object.values(schemaItem).length) {
            return null;
          }


          const name: string = Object.keys(schemaItem)[0];

          if (schemaItem[name].type === 'boolean') {
            return null;
          }

          const exampleValue = schemaItem[name].enum?.[0] || schemaItem[name].examples?.[0];

          const type: AttributeTypesEnum = schemaItem[name].type === 'string' ? AttributeTypesEnum.text : AttributeTypesEnum.numeric;
          const value = type === AttributeTypesEnum.numeric ? parseInt(exampleValue, 10).toString() : exampleValue;


          return { name, type, value };
        }).filter(Boolean);

        const newAttributesName = attributes.map(attribute => attribute.name);

        this.attributesForm.value?.forEach((attribute, index) => {
          if (!newAttributesName.includes(attribute.name)) {
            this.attributesForm.removeAt(index);
          }
        });

        attributes.forEach((attribute) => {
          if (!this.attributesForm.value.find(attr => attr.name === attribute.name)) {
            this.addAttribute(attribute);
          }
        });

        this.changeDetectorRef.detectChanges();
      },
      catchError(() => {
        return of([]);
      }),
    ));
  }

  getAttributeErrorTranslationKey(name: string, required: boolean): string {
    const prefix: string = required ? 'required' : 'invalid';

    return `attributeEditor.errors.${name}_${prefix}`;
  }

  protected createForm(): void {
    const attributes = this.sectionsService.attributesSection;

    this.form = this.formBuilder.group({
      attributes: this.formBuilder.array([]),
    });

    attributes.forEach((attribute) => {
      this.addAttribute(attribute);
    });

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues): void {
    this.sectionsService.onChangeAttributesSection(formValues.attributes);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}

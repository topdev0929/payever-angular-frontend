import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import {
    AutocompleteChangeEvent,
    AutocompleteChipsSize,
    ErrorBag,
    FormAbstractComponent,
    FormScheme,
    SelectChangeEvent,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaContainerType, MediaUrlPipe, MediaUrlTypeEnum } from '@pe/media';

import { SectionsService } from '../../../services';
import { ExternalError, RecommendationsSection } from '../../../../shared/interfaces/section.interface';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { EnvService } from '../../../../shared/services/env.service';
import { ProductsApiService } from '../../../../shared/services/api.service';
import { RecommendationTagsEnum } from '../../../../shared/enums/recommendation-tags.enum';
import { RecommendationsInterface, RecommendationsItem } from '../../../../shared/interfaces/recommendations.interface';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'recommendations-section',
  templateUrl: 'editor-recommendations-section.component.html',
  styleUrls: ['editor-recommendations-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorRecommendationsSectionComponent extends FormAbstractComponent<RecommendationsSection> {
  @Input() externalError: Subject<ExternalError>;

  // tslint:disable-next-line:variable-name
  readonly add_product_translation = this.translateService.translate('recommendations.add_product');
  readonly section: ProductEditorSections = ProductEditorSections.Recommendations;
  recommendationsSection: RecommendationsSection = this.sectionsService.recommendationsSection;
  formScheme: FormScheme;
  formTranslationsScope = 'recommendationsSection.form';
  productOptions: string[] = [];
  categoryOptions: string[] = [];
  collectionOptions: string[] = [];
  oldRecommendation: RecommendationsInterface;
  tags = RecommendationTagsEnum;

  protected formStorageKey = 'recommendationsSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private apiService: ProductsApiService,
    private sectionsService: SectionsService,
    private envService: EnvService,
    private mediaUrlPipe: MediaUrlPipe,
    private readonly translateService: TranslateService,
  ) {
    super(injector);
  }

  private requestBackendData(next: (allRecommendations: RecommendationsInterface[] | null,
                                    productRecommendations: RecommendationsInterface | null) => void,
  ): void {
    this.apiService
    .getRecommendations(this.envService.businessUuid)
    .pipe(
      tap(({data: response}) => {
        if (!response || !response.getRecommendations) {
          return next(null, null);
        }

        const { getRecommendations } = response;
        if (!this.sectionsService.model.id) {
          return next(getRecommendations, null);
        } else {
          this.apiService.getProductRecommendations(this.sectionsService.model.id).pipe(
            tap(({data}) => {
              if (!data || !data.getProductRecommendations) {
                return next(getRecommendations, null);
              }

              next(getRecommendations, data.getProductRecommendations);
            }),
            catchError((error: HttpErrorResponse) => {
              console.error('Error fetching product recommendations', error);
              next(getRecommendations, null);
              return [];
            }),
          ).subscribe();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching all recommendations', error);
        next(null, null);
        return [];
      }),
    ).subscribe();
  }

  private processBackendData(
    allRecommendations: RecommendationsInterface[] | null,
    productRecommendations: RecommendationsInterface | null,
  ):
  {
    categoryOptions: string[],
    collectionOptions: string[],
    productOptions: string[],
    sectionData: RecommendationsSection,
    selectedCategories: string[],
    selectedCollections: string[],
  } {
    const sectionData: RecommendationsSection = this.recommendationsSection;
    let selectedCategories: string[] = [];
    let selectedCollections: string[] = [];

    if (allRecommendations) {
      this.sectionsService.allRecommendations = allRecommendations;
    }
    if (productRecommendations && productRecommendations.recommendations) {
      sectionData.allowRecommendations = true;
      sectionData.currentRecommendations = productRecommendations.recommendations;
      sectionData.recommendationTag = productRecommendations.tag;
      this.sectionsService.model.recommendations = productRecommendations;
      this.sectionsService.recommendations$.next(productRecommendations);

      if (productRecommendations.tag === RecommendationTagsEnum.byCategory) {
        selectedCategories = productRecommendations.recommendations.map((el: RecommendationsItem) => el.name);
      } else if (productRecommendations.tag === RecommendationTagsEnum.byCollection) {
        selectedCollections = productRecommendations.recommendations.map((el: RecommendationsItem) => el.name);
      }
    }

    sectionData.recommendationTag = sectionData.recommendationTag || RecommendationTagsEnum.byProduct;
    this.resetOptions(this.productOptions, this.categoryOptions, this.collectionOptions);

    return {
      categoryOptions: this.categoryOptions,
      collectionOptions: this.collectionOptions,
      productOptions: this.productOptions,
      sectionData,
      selectedCategories,
      selectedCollections,
     };
  }

  validateChipInput(tag: RecommendationTagsEnum): (value: string) => boolean {
    let recommendations: RecommendationsItem[] | undefined = this.sectionsService.allRecommendations.find((value: RecommendationsInterface) => value.tag === tag)?.recommendations;
    recommendations = recommendations || [];

    return (val: string): boolean => {
      const isDuplicate: boolean = recommendations.some((recommendation: { name: string }) => {
        return recommendation.name === val;
      });
      return isDuplicate;
    };
  }

  onChipChange({ value, eventType }: AutocompleteChangeEvent): void {
    this.recommendationsSection.currentRecommendations.length = 0;
    let recommendations: RecommendationsItem[] | undefined  =
      this.sectionsService.allRecommendations.find(
        (valueData: RecommendationsInterface) =>
          valueData.tag === this.recommendationsSection.recommendationTag)?.recommendations;
    recommendations = recommendations || [];

    for (const name of value) {
      const found: RecommendationsItem | undefined = recommendations
        .find((el: RecommendationsItem) => el.name === name);

      if (found) {
        this.recommendationsSection.currentRecommendations.push(found);
      }
    }

    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
  }

  protected createForm(): void {
    this.requestBackendData(
      (allRecommendations: RecommendationsInterface[] | null,
       productRecommendations: RecommendationsInterface | null) => {
      const {
        categoryOptions,
        collectionOptions,
        productOptions,
        sectionData,
        selectedCategories,
        selectedCollections,
      } = this.processBackendData(allRecommendations, productRecommendations);
      const currentRecommendationTag = sectionData.recommendationTag;

      this.form = this.formBuilder.group({
        allowRecommendations: [sectionData.allowRecommendations],
        recommendationTag: [currentRecommendationTag],
        selectedRecommendations: [sectionData.currentRecommendations],
        productRecommendation: [],
        categoryRecommendation: [selectedCategories],
        collectionRecommendation: [selectedCollections],
      });

      this.formScheme = {
        fieldsets: {
          allowRecommendations: [
            {
              name: 'allowRecommendations',
              type: 'slide-toggle',
              fieldSettings: {
                classList: 'col-xs-12 label-white',
                label: this.translateService.translate('recommendations.allow_recommendations'),
              },
            },
          ],
          recommendationTag: [
            {
              name: 'recommendationTag',
              type: 'select',
              fieldSettings: {
                classList: `col-xs-12 label-white`,
                required: true,
                label: this.translateService.translate('recommendations.recommendation_type'),
              },
              selectSettings: {
                options: [
                  {
                    label: 'Category',
                    value: RecommendationTagsEnum.byCategory,
                  },
                  {
                    label: 'Products',
                    value: RecommendationTagsEnum.byProduct,
                  },
                  {
                    label: 'Collections',
                    value: RecommendationTagsEnum.byCollection,
                  },
                ],
                onValueChange: (e: SelectChangeEvent) => this.onRecommendationTagChanged(e),
                panelClass: 'mat-select-dark',
              },
            },
          ],
          productRecommendation: [
            {
              name: 'productRecommendation',
              type: 'autocomplete',
              fieldSettings: {
                classList: `col-xs-12 label-white`,
                label: 'productRecommendation',
              },
              autocompleteSettings: {
                autoActiveFirstOption: true,
                options: productOptions,
                placeholder: this.translateService.translate('recommendations.add_products'),
              },
            },
          ],
          categoryRecommendation: [
            {
              name: 'categoryRecommendation',
              type: 'autocomplete-chips',
              fieldSettings: {
                classList: `col-xs-12 label-white`,
              },
              autocompleteChipsSettings: {
                autoActiveFirstOption: true,
                chipsSize: AutocompleteChipsSize.Default,
                options: categoryOptions,
                onValueChange: (e: AutocompleteChangeEvent) => this.onChipChange(e),
                placeholder: this.translateService.translate('recommendations.enter_category'),
                separatorKeys: [COMMA, ENTER],
                validateInput: this.validateChipInput(RecommendationTagsEnum.byCategory),
              },
            },
          ],
          collectionRecommendation: [
            {
              name: 'collectionRecommendation',
              type: 'autocomplete-chips',
              fieldSettings: {
                classList: `col-xs-12 label-white`,
              },
              autocompleteChipsSettings: {
                autoActiveFirstOption: true,
                chipsSize: AutocompleteChipsSize.Default,
                options: collectionOptions,
                onValueChange: (e: AutocompleteChangeEvent) => this.onChipChange(e),
                placeholder: this.translateService.translate('recommendations.enter_collection'),
                separatorKeys: [COMMA, ENTER],
                validateInput: this.validateChipInput(RecommendationTagsEnum.byCollection),
              },
            },
          ],
        },
      };

      this.form.get('recommendationTag').valueChanges.pipe(
        tap(value => this.onRecommendationTagChanged({ value })),
        takeUntil(this.destroyed$),
      ).subscribe();

      this.changeDetectorRef.detectChanges();
    });
  }

  protected onUpdateFormData(formValues: any): void {
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  private resetOptions(productOptions: string[], categoryOptions: string[], collectionOptions: string[]): void {
    const { recommendationsSection } = this;
    const currentRecommendationTag: RecommendationTagsEnum = recommendationsSection.recommendationTag;
    productOptions.length = 0;
    categoryOptions.length = 0;
    collectionOptions.length = 0;

    (this.sectionsService.allRecommendations
      .find((el: RecommendationsInterface) => el.tag === RecommendationTagsEnum.byProduct)?.recommendations || [])
      .map((el: RecommendationsItem) => el.name)
      .filter((name: string) => !(
        currentRecommendationTag === RecommendationTagsEnum.byProduct &&
        recommendationsSection.currentRecommendations.find((option: RecommendationsItem) => option.name === name)
      ))
      .forEach((option: string) => productOptions.push(option));

    (this.sectionsService.allRecommendations
      .find((el: RecommendationsInterface) => el.tag === RecommendationTagsEnum.byCategory)?.recommendations || [])
      .map((el: RecommendationsItem) => el.name)
      .filter((name: string) => !(
        currentRecommendationTag === RecommendationTagsEnum.byCategory &&
        recommendationsSection.currentRecommendations.find((option: RecommendationsItem) => option.name === name)
      ))
      .forEach((option: string) => categoryOptions.push(option));

    (this.sectionsService.allRecommendations
      .find((el: RecommendationsInterface) => el.tag === RecommendationTagsEnum.byCollection)?.recommendations || [])
      .map((el: RecommendationsItem) => el.name)
      .filter((name: string) => !(
        currentRecommendationTag === RecommendationTagsEnum.byCollection &&
        recommendationsSection.currentRecommendations.find((option: RecommendationsItem) => option.name === name)
      ))
      .forEach((option: string) => collectionOptions.push(option));
  }

  onRecommendationTagChanged({ value }: SelectChangeEvent): void {
    if (this.recommendationsSection.recommendationTag !== value) {
      this.form.get('categoryRecommendation').value.length = 0;
      this.form.get('collectionRecommendation').value.length = 0;
      this.recommendationsSection.currentRecommendations.length = 0;
    }

    this.recommendationsSection.recommendationTag = value;
    this.form.get('productRecommendation').reset();
    this.resetOptions(this.productOptions, this.categoryOptions, this.collectionOptions);
    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
    this.changeDetectorRef.detectChanges();
  }

  onToggleChanged(checked: boolean) {
    this.recommendationsSection.allowRecommendations = checked;
    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
  }

  addRecommendation(control: string, options: string[]) {
    const recommendationName: string = this.form.get(control).value;
    if (!recommendationName) {
      return;
    }

    const recommendationTag: RecommendationTagsEnum = this.recommendationsSection.recommendationTag;
    const recommendationItem: RecommendationsItem = this.sectionsService.allRecommendations
      .find((el: RecommendationsInterface) => el.tag === recommendationTag)
      .recommendations
      .find((el: RecommendationsItem) => el.name === recommendationName);
    const alreadyExists: boolean = !!this.recommendationsSection.currentRecommendations
      .find((el: RecommendationsItem) => el.name === recommendationName);

    if (!recommendationItem || alreadyExists) {
      return;
    }

    options.forEach((el: string, idx: number) => {
      if (el === recommendationName) {
        options.splice(idx, 1);
      }
    });

    this.form.get(control).setValue('');
    this.recommendationsSection.currentRecommendations.push(recommendationItem);
    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
  }

  removeRecommendation(recommendation: RecommendationsItem) {
    this.recommendationsSection.currentRecommendations
      .forEach((el: RecommendationsItem, idx: number) => {
        if (el.id === recommendation.id && el.name === recommendation.name) {
          this.recommendationsSection.currentRecommendations.splice(idx, 1);
        }
      });

    this.productOptions.push(recommendation.name);
    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
  }

  getImagePath(blob: string): string {
    if (blob) {
      return this.mediaUrlPipe.transform(`${blob}`, MediaContainerType.Products, MediaUrlTypeEnum.Thumbnail);
    }
  }
}

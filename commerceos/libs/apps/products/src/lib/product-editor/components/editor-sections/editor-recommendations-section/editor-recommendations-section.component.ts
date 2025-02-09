import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Inject, Injector, Input } from '@angular/core';
import { uniqBy } from 'lodash';
import { BehaviorSubject, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import {
  AutocompleteChangeEvent,
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  SelectChangeEvent,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { MediaContainerType, MediaUrlPipe, MediaUrlTypeEnum } from '@pe/media';
import { PeSearchOptionInterface } from '@pe/ui';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { RecommendationTagsEnum } from '../../../../shared/enums/recommendation-tags.enum';
import { RecommendationsInterface, RecommendationsItem } from '../../../../shared/interfaces/recommendations.interface';
import { ExternalError, RecommendationsSection } from '../../../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../../../shared/services/api.service';
import { SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';

@Component({
  selector: 'recommendations-section',
  templateUrl: 'editor-recommendations-section.component.html',
  styleUrls: ['editor-recommendations-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorRecommendationsSectionComponent extends FormAbstractComponent<RecommendationsSection> {
  @Input() externalError: Subject<ExternalError>;

  readonly add_product_translation = this.translateService.translate('recommendations.add_product');
  readonly section: ProductEditorSections = ProductEditorSections.Recommendations;
  recommendationsSection: RecommendationsSection = this.sectionsService.recommendationsSection;
  formScheme: FormScheme;
  formTranslationsScope = 'recommendationsSection.form';
  productOptions: string[] = [];
  categoryOptions: string[] = [];
  collectionOptions: string[] = [];

  recommendationSearchItems$ = new BehaviorSubject<PeSearchOptionInterface[]>([]);
  recommendationSearchItemsFilter = '';

  oldRecommendation: RecommendationsInterface;
  tags = RecommendationTagsEnum;
  isDisabled = false;

  protected formStorageKey = 'recommendationsSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private apiService: ProductsApiService,
    private sectionsService: SectionsService,
    private envService: EnvService,
    private mediaUrlPipe: MediaUrlPipe,
    private readonly translateService: TranslateService,
    private countryService: CountryService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    super(injector);
  }

  private requestBackendData(next: (allRecommendations: RecommendationsInterface[] | null,
    productRecommendations: RecommendationsInterface | null) => void,
  ): void {
    this.apiService
      .getRecommendations(this.envService.businessId)
      .pipe(
        tap(({ data: response }) => {
          if (!response?.getRecommendations) {
            return next(null, null);
          }

          const { getRecommendations } = response;
          if (!this.sectionsService.model.id) {
            return next(getRecommendations, null);
          } else {
            this.apiService.getProductRecommendations(this.sectionsService.model.id).pipe(
              tap(({ data }) => {
                if (!data?.getProductRecommendations) {
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
        takeUntil(this.destroyed$),
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
  ): {
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
    if (productRecommendations?.recommendations) {
      sectionData.allowRecommendations = true;
      sectionData.currentRecommendations = productRecommendations.recommendations;
      sectionData.recommendationTag = productRecommendations.tag;
      this.sectionsService.model.recommendations = productRecommendations;
      this.sectionsService.recommendations$.next(productRecommendations);

      if (productRecommendations.tag === RecommendationTagsEnum.byCategory) {
        selectedCategories = productRecommendations.recommendations.map((el: RecommendationsItem) => el.name);
      } else if (productRecommendations.tag === RecommendationTagsEnum.byFolder) {
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
    let recommendations: RecommendationsItem[] | undefined = this.sectionsService.allRecommendations.find(
      (value: RecommendationsInterface) => value.tag === tag
    )?.recommendations;
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
    let recommendations: RecommendationsItem[] | undefined =
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

        this.form.get('recommendationTag').valueChanges.pipe(
          tap(value => this.onRecommendationTagChanged({ value })),
          takeUntil(this.destroyed$),
        ).subscribe();

        this.countryService.updatedCountry$.pipe(
          tap(({ recommendations: productRecommendations }) => {
            if (!productRecommendations) {
              this.form.reset();

              return;
            }
            const {
              sectionData,
              selectedCategories,
              selectedCollections,
            } = this.processBackendData(allRecommendations || [], productRecommendations);
            this.form.patchValue({
              allowRecommendations: sectionData.allowRecommendations,
              recommendationTag: sectionData.recommendationTag,
              selectedRecommendations: sectionData.currentRecommendations,
              categoryRecommendation: selectedCategories,
              collectionRecommendation: selectedCollections,
            });

            this.changeDetectorRef.detectChanges();
          }),
          takeUntil(this.destroyed$)
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
    const recommendationsSection = this.recommendationsSection;
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
      .find((el: RecommendationsInterface) => el.tag === RecommendationTagsEnum.byFolder)?.recommendations || [])
      .map((el: RecommendationsItem) => el.name)
      .filter((name: string) => !(
        currentRecommendationTag === RecommendationTagsEnum.byFolder &&
        recommendationsSection.currentRecommendations.find((option: RecommendationsItem) => option.name === name)
      ))
      .forEach((option: string) => {
        collectionOptions.push(option);
      });
  }

  onRecommendationTagChanged({ value }: SelectChangeEvent): void {
    if (this.recommendationsSection.recommendationTag !== value) {
      if (this.form.get('categoryRecommendation').value) {
        this.form.get('categoryRecommendation').value.length = 0;
      }

      if (this.form.get('collectionRecommendation').value) {
        this.form.get('collectionRecommendation').value.length = 0;
      }

      this.recommendationsSection.currentRecommendations.length = 0;
    }

    this.recommendationsSection.recommendationTag = value;
    this.form.get('productRecommendation').reset();
    this.resetOptions(this.productOptions, this.categoryOptions, this.collectionOptions);
    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
    this.updateSearchItems();
    this.changeDetectorRef.detectChanges();
  }

  onToggleChanged(checked: boolean) {
    this.recommendationsSection.allowRecommendations = checked;
    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
    this.updateSearchItems();
  }

  addRecommendation(value: PeSearchOptionInterface) {
    const recommendationName = value.title;
    const recommendationTag: RecommendationTagsEnum = this.recommendationsSection.recommendationTag;
    const recommendationItem: RecommendationsItem = this.sectionsService.allRecommendations
      .find((el: RecommendationsInterface) => el.tag === recommendationTag)
      .recommendations
      .find((el: RecommendationsItem) => el.name === recommendationName);
    const alreadyExists = !!this.recommendationsSection.currentRecommendations
      .find((el: RecommendationsItem) => el.name === recommendationName);

    if (!recommendationItem || alreadyExists) {
      return;
    }

    this.recommendationsSection.currentRecommendations.push(recommendationItem);
    this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
    this.updateSearchItems();
  }

  removeRecommendation(recommendation: RecommendationsItem) {
    if (!this.isDisabled) {
      this.recommendationsSection.currentRecommendations
        .forEach((el: RecommendationsItem, idx: number) => {
          if (el.id === recommendation.id && el.name === recommendation.name) {
            this.recommendationsSection.currentRecommendations.splice(idx, 1);
          }
        });

      this.productOptions.push(recommendation.name);
      this.sectionsService.onChangeRecommendationsSection(this.recommendationsSection);
    }
  }

  updateSearchItems() {
    if (!this.recommendationSearchItemsFilter){
      this.recommendationSearchItems$.next([]);

      return;
    }
    const tag = this.form.get('recommendationTag').value;

    const recommendations =
      (this.sectionsService.allRecommendations
        .find((el: RecommendationsInterface) => el.tag === tag)?.recommendations || [])
        .filter((el: RecommendationsItem) => el.id !== this.sectionsService.model.id)
        .map((el: RecommendationsItem) => ({
          title: el.name,
          value: el.id,
          image: this.getImagePath(el.images?.length ? el.images[0] : '', tag),
        }))
        .filter(item => !
          this.recommendationsSection.currentRecommendations.find((option: RecommendationsItem) => option.name === item.title)
        );

    this.recommendationSearchItems$.next(uniqBy(recommendations, 'title'));
  }

  onChangeFilter(event){
    this.recommendationSearchItemsFilter = event;
    this.updateSearchItems();
  }

  getImagePath(blob: string, tagName: string): string {
    if (tagName === RecommendationTagsEnum.byProduct) {
      return blob
        ? this.mediaUrlPipe.transform(`${blob}`, MediaContainerType.Products, MediaUrlTypeEnum.Thumbnail)
        : 'assets/icons/folder-grid.png';
    }

    return '';
  }

  getRecommendationDisplayImage(recommendationItem: RecommendationsItem) {
    const tag = this.form.get('recommendationTag').value;

    return this.getImagePath(recommendationItem?.images?.length ? recommendationItem.images[0] : '', tag);
  }
}

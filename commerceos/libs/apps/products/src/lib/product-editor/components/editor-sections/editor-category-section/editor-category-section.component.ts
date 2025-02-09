import { ChangeDetectionStrategy, Component, Injector, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray } from '@angular/forms';
import { get, union } from 'lodash-es';
import { AsyncSubject, BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import {
  AutocompleteChangeEvent,
  AutocompleteChipsEventType,
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
} from '@pe/forms';
import { PeSearchComponent, PeSearchOptionInterface } from '@pe/ui';

import { ChannelTypes, ProductEditorSections } from '../../../../shared/enums/product.enum';
import { PE_CHANNELS_GROUPS } from '../../../../shared/interfaces/channel-group.interface';
import { ChannelSetCategoriesInterface } from '../../../../shared/interfaces/channel-set-category.interface';
import { ChannelSetInterface } from '../../../../shared/interfaces/channel-set.interface';
import { ChannelInterface } from '../../../../shared/interfaces/channel.interface';
import { Category, CategorySection, ExternalError, MainSection } from '../../../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../../../shared/services/api.service';
import { CategoryPredictionApiService, SectionsService } from '../../../services';
import { LanguageService } from '../../../services/language.service';
import { channelsWithPredictedCategories } from '../editor-config';

const DEFAULT_CATEGORIES: string[] = [
  'Arts & Crafts',
  'Baby',
  'Beauty & Personal Care',
  'Books',
  'Computers',
  'Electronics',
  'Fashion',
  'Health & Household',
  'Home & Kitchen',
  'Luggage',
  'Movies & TV',
  'Music, CDs & Vinyl',
  'Pet Supplies',
  'Sports & Outdoors',
  'Tools & Home Improvement',
  'Toys & Games',
  'Video Games',
];


interface CategoriesSectionFormInterface {
  categories: string[];
  channelSetCategories: any[];
}

interface ChannelSetFormInterface extends ChannelSetInterface {
  label: string;
  enabled: boolean;
}

@Component({
  selector: 'category-section',
  templateUrl: 'editor-category-section.component.html',
  styleUrls: ['editor-category-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorCategorySectionComponent extends FormAbstractComponent<CategorySection> implements OnInit {
  @Input() externalError: Subject<ExternalError>;
  @ViewChildren(PeSearchComponent) peSearchComponents: QueryList<PeSearchComponent>;

  readonly section: ProductEditorSections = ProductEditorSections.Category;
  channels$: AsyncSubject<ChannelInterface[]> = new AsyncSubject<ChannelInterface[]>();

  categories: Category[] = [];
  categoryOptions: { [key: string]:  string[] } = {};
  categorySection: CategorySection = this.sectionsService.categorySection;
  formScheme: FormScheme;
  formTranslationsScope = 'categorySection.form';
  searchItems$ = new BehaviorSubject<{ [key: string]: PeSearchOptionInterface[] }>({});
  searchItemsFilter = '';
  channelSets: any = [];
  categoryForm: FormScheme;
  predictedCategories$: Observable<string[]>;

  protected formStorageKey = 'categorySection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private apiService: ProductsApiService,
    private sectionsService: SectionsService,
    private envService: EnvService,
    private languageService: LanguageService,
    private categoryPredictionApiService: CategoryPredictionApiService,
  ) {
    super(injector);
  }

  // remove
  get _panelOpened$(): Observable<ProductEditorSections> {
    return this.sectionsService.activeSection$.pipe(
      filter((section: ProductEditorSections) => section === this.section),
    );
  }

  get categories$(): Observable<Category[]> {
    const categoriesPerPage = 100;

    return this.apiService
      .getCategories(this.envService.businessId, '', 1, categoriesPerPage)
      .pipe(map(({ data: { getCategories } }) => getCategories));
  }

  get channelSetCategories(): FormArray {
    return this.form.get('channelSetCategories') as FormArray;
  }

  ngOnInit(): void {
    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap(() => {
          this.categorySection = this.sectionsService.categorySection;
          this.form.get('categories').setValue(this.categorySection.categories.reduce(
            (acc, item) => [...acc, item.title], []
          ));

          this.changeDetectorRef.detectChanges();
          this.sectionsService.onChangeCategorySection(this.categorySection);
        })
      ),
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.externalError
      .pipe(
        takeUntil(this.destroyed$),
        filter((item: any) => item.section === ProductEditorSections.Category),
      )
      .subscribe((item: any) => {
        const errors: any = {};
        errors[item.field] = item.errorText;
        this.errorBag.setErrors(errors);
        this.changeDetectorRef.detectChanges();
      });

    this.sectionsService.mainSectionChange$.pipe(
      filter(section => section.title !== ''),
      debounceTime(300),
      switchMap((section: MainSection) => {
        return this.categoryPredictionApiService.getPredictions(section.title).pipe(
          map((response) => {
            channelsWithPredictedCategories.forEach((channelType: ChannelTypes) => {
              const id = this.getChannelSetId(channelType);
              if (id) {
                this.categoryOptions[id] = response?.predictions || [];
              }
            });

            return response;
          }));
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.sectionsService.channelSets$.pipe(
      tap(({ channel, isChecked }) => {
        const index = this.channelSetCategories?.value?.findIndex((channelSet: any) => channelSet.id === channel.id);
        if (index === -1 && isChecked) {
          const data: CategorySection = this.categorySection;
          const channelSet = this.getChannleSetWithLabel(channel);
          const group = this.getChannelSetCategoryFormGroup(channelSet, data, isChecked);
          this.channelSetCategories.push(group);
        } else {
          this.channelSetCategories?.at(index)?.patchValue({
            ...this.channelSetCategories.at(index).value,
            enabled: isChecked,
          });
        }
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  isPredictionChannelSet(channelSet: ChannelSetInterface): boolean {
    return channelsWithPredictedCategories.includes(channelSet.type as ChannelTypes);
  }

  getChannelSetId(channelType: ChannelTypes) {
    return this.sectionsService.model.channelSets.find(channelSet => channelSet.type === channelType)?.id;
  }

  onCategoryChange({ value, eventType }: AutocompleteChangeEvent, id: string): void {
    if (eventType === AutocompleteChipsEventType.Add) {
      const businessId: string = this.envService.businessId;
      const addedCategory: string = value;
      this.apiService.createCategory(businessId, addedCategory).subscribe((category) => {
        this.sectionsService.allCategories = [
          ...this.sectionsService.allCategories,
          get(category, 'data.createCategory', []),
        ];
      });
    }
  }

  addCategory(value: string, id: string, index: number): void {
    const values = [...this.getSelectedCategories(id)];
    const categoryItem = this.sectionsService.allCategories.find(el => el.title === value);

    this.onCategoryChange({ value, eventType: AutocompleteChipsEventType.Add }, id);

    if (!value?.replace(/\s+/g, '').length || !categoryItem) {
      if (value && value.replace(/\s+/g, '').length > 0) {
        values.push(value);
      }
    } else {

      if (!value) {
        return;
      }

      values.push(value);

      this.categoryOptions[id]?.forEach((el: string, idx: number) => {
        if (el === value) {
          this.categoryOptions[id]?.splice(idx, 1);
        }
      });

      this.categorySection.categories.push(categoryItem);


      const index = this.categorySection.channelSetCategories?.findIndex(category => category.channelSetId === id);
      this.categorySection.channelSetCategories[index]?.categories?.push(categoryItem);

      this.sectionsService.onChangeCategorySection(this.categorySection);
      this.updateSearchItems(id);
    }

    this.channelSetCategories.at(index)?.patchValue({ ...this.channelSetCategories.at(index).value, categories: values });
  }

  removeCategory(value, id, index) {
    const categoryItem = this.sectionsService.allCategories.find(el => el.title === value);

    const selectedCategories = this.getSelectedCategories(id).filter((category: string) => category !== value);
    this.channelSetCategories.at(index)?.patchValue({
      ...this.channelSetCategories.at(index).value,
      categories: selectedCategories,
    });

    this.categorySection.channelSetCategories[index]?.categories.forEach((el: Category, idx: number) => {
      if (el.id === categoryItem.id && el.title === categoryItem.title) {
        this.categorySection.channelSetCategories[index].categories.splice(idx, 1);
      }
    });

    const i = this.categorySection.channelSetCategories?.findIndex(category => category.channelSetId === id);
    this.categorySection.channelSetCategories[i]?.categories?.forEach((el: Category, idx: number) => {
      if (el.title === categoryItem.title) {
        this.categorySection.channelSetCategories[i]?.categories?.splice(idx, 1);
      }
    });

    this.categoryOptions[id].push(categoryItem.title);
    this.sectionsService.onChangeCategorySection(this.categorySection);

    this.updateSearchItems(id);
  }

  getChannleSetWithLabel(channelSet) {
    const channel = PE_CHANNELS_GROUPS.find((channelGroup) => {
      return channelSet.type === channelGroup.type;
    });


    return {
      ...channelSet,
      label: channelSet.name || channel?.name,
    };
  }

  getAllChannelSetsWithLabel() {
    return this.sectionsService.model.channelSets.map(this.getChannleSetWithLabel);
  }

  public updateSearchItems(id: string, forceUpdate: boolean = false): void {

    const currentValue: { [key: string]: PeSearchOptionInterface[] } = this.searchItems$.value;
    const selectedItems: string[] = this.getSelectedCategories(id);
    const searchedItems: PeSearchOptionInterface[] = this.getSearchCategories(this.categoryOptions[id], selectedItems);
    currentValue[id] = searchedItems;

    this.searchItems$.next({ ...currentValue });
  }

  public getSelectedCategories(id: string): string[] {
    return this.channelSetCategories.value.find((channelSet: any) => channelSet.id === id)?.categories || [];
  }

  public getSearchCategories(categoryOptions: string[], selectedItems: string[]) {
    return categoryOptions
      .filter(value => !selectedItems.some(s => s === value))
      .map(value => ({ image: '', title: value, value }));
  }

  public onChangeFilter(value: string, id: string): void {
    this.searchItemsFilter = value;
    this.updateSearchItems(id);
  }

  public openCategorySection(key: string) {
    this.peSearchComponents.forEach((component) => {
      if (component.key === key) {
        component.setFocusAndOpen();
        this.updateSearchItems(key);
      }
    });
  }

  validateInput(val: string): boolean {
    const isDuplicate: boolean = this.form.controls.categories.value.some((category: string) => {
      return category === val;
    });

    return !isDuplicate;
  }

  getChannelSetCategoryFormGroup(channelSet: ChannelSetFormInterface, data: CategorySection, isChecked: boolean) {
    const isPredictionChannelSet: boolean = this.isPredictionChannelSet(channelSet);
    const categories = this.sectionsService.allCategories;

    const channelSetSelectedCategories: string[] = Array.isArray(data.channelSetCategories) ? data.channelSetCategories?.
    find(c => c.channelSetId === channelSet.id)?.categories?.
    map((category: Category) => category.title) || [] : [];

    this.categoryOptions[channelSet.id] = isPredictionChannelSet ? [] : union(
      categories
        .map((category: Category) => category.title)
        .filter(title => !channelSetSelectedCategories.includes(title)),
      DEFAULT_CATEGORIES.filter(title => !channelSetSelectedCategories.includes(title)),
    );

    return this.formBuilder.group({
      id: channelSet.id,
      categories: [channelSetSelectedCategories],
      label: channelSet.label,
      type: channelSet.type,
      enabled: isChecked,
    });
  }

  protected createForm(initialData: CategorySection): void {
    const data: CategorySection = this.categorySection;
    const selectedCategories: string[] = data.categories.filter(c => c).map((category: Category) => category.title);

    this.categories$.subscribe((categories: Category[]) => {
      this.sectionsService.allCategories = categories;

      const allChannelSets = this.getAllChannelSetsWithLabel().map((channelSet: ChannelSetFormInterface) => {
        return this.getChannelSetCategoryFormGroup(channelSet, data, true);
      });


      this.form = this.formBuilder.group({
        categories: [selectedCategories],
        channelSetCategories: this.formBuilder.array(allChannelSets || []),
      });


      this.changeDetectorRef.detectChanges();
    });
  }

  protected onUpdateFormData(formValues: CategoriesSectionFormInterface): void {
    const categories: Array<{ title: string }> = formValues.categories.map((category: string) => ({ title: category }));

    const channelSetCategories: ChannelSetCategoriesInterface[] = formValues.channelSetCategories.map(
      (channelSet: any) => {
        return {
          channelSetId: channelSet.id,
          categories: channelSet.categories?.map((category: string) => ({ title: category })) || [],
          channelSetType: channelSet.type,
        };
      },
    );
    this.categorySection = {
      ...this.categorySection,
      channelSetCategories,
    };

    this.sectionsService.onChangeCategorySection({
      categories,
      channelSetCategories,
    });
  }

  protected onSuccess(): void {
    this.sectionsService.prepareCategories();
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}

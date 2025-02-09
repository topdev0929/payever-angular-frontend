import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import {
  PeDataGridFilter,
  PeDataGridFilterItem,
  PeDataGridItem,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction, PeDataGridSingleSelectedAction
} from '@pe/data-grid';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PeAdsApi } from '../../api/abstract.ads.api';
import { AbstractComponent } from '../../misc/abstract.component';

export interface SortAction {
  field: string;
  asc: boolean;
}

export const CDN_URL = 'https://payevertest.azureedge.net';

@Component({
  selector: 'peb-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebCampaignsComponent extends AbstractComponent implements OnInit {
  adPlaceholderURL = `${CDN_URL}/placeholders/ad-placeholder.png`;
  readonly campaignsUpdatedSubject$ = new BehaviorSubject<any>(null);

  campaigns$: Observable<PeDataGridItem[]> = this.campaignsUpdatedSubject$.asObservable().pipe(
    switchMap(() => {
      return this.api.getCampaigns()
        .pipe(
          switchMap((campaigns: any) => {
            return combineLatest([
              this.selectedFilters$,
              this.searchString$,
              this.selectedSort$,
            ]).pipe(
              map(([selectedFilters, searchString, selectedSort]) => {
                return this.getFilteredCampaigns(campaigns, selectedFilters, searchString, selectedSort);
              }),
            );
          }),
        );
    })
  );

  filters: PeDataGridFilter[] = [
    {
      title: 'Campaigns',
      items: [
        {
          title: 'Drafts',
          key: 'DRAFT',
          image: `${CDN_URL}/icons-filter/drafts.svg`
        }
      ]
    },
  ];
  dataGridListOptions: PeDataGridListOptions;
  showCollectionsCountInHeader = false;

  readonly selectedSortSubject$ = new BehaviorSubject<SortAction>(null);
  selectedSort$ = this.selectedSortSubject$.asObservable();
  set selectedSort(sortAction: SortAction) {
    this.selectedSortSubject$.next(sortAction);
  }

  sortByActions: any[] = [
    {
      label: 'Title (A-Z)',
      callback: () => this.selectedSort = { field: 'title', asc: true },
    },
    {
      label: 'Title (Z-A)',
      callback: () => this.selectedSort = { field: 'title', asc: false },
    },
  ];

  readonly selectedCampaignsSubject$ = new BehaviorSubject<string[]>([]);
  selectedCampaigns$ = this.selectedCampaignsSubject$.asObservable();
  set selectedCampaigns(ids: string[]) {
    this.selectedCampaignsSubject$.next(ids);
  }
  get selectedCampaigns() {
    return this.selectedCampaignsSubject$.value;
  }

  readonly selectedFiltersSubject$ = new BehaviorSubject<PeDataGridFilterItem[]>([]);
  selectedFilters$ = this.selectedFiltersSubject$.asObservable();
  set selectedFilters(filters: PeDataGridFilterItem[]) {
    this.selectedFiltersSubject$.next(filters);
  }

  readonly searchStringSubject$ = new BehaviorSubject<string>(null);
  searchString$ = this.searchStringSubject$.asObservable();
  set searchString(searchString: string) {
    this.searchStringSubject$.next(searchString);
  }

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: 'Delete',
      callback: () => this.onDelete(this.selectedCampaigns),
    },
    {
      label: 'Select all',
      callback: () => {
        this.campaigns$.pipe(
          take(1),
          tap((campaigns: any) => {
            this.selectedCampaigns = campaigns.map((c: any) => c.id);
          }),
        ).subscribe();
      },
    },
    {
      label: 'Deselect all',
      callback: () => this.selectedCampaigns = [],
    },
  ];

  firstCardAction: PeDataGridSingleSelectedAction = {
    label: 'Open',
    callback: (campaignId: string) => {
      this.onOpenCampaign(campaignId);
    }
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private api: PeAdsApi,
    @Optional() private platformHeader: PePlatformHeaderService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataGridListOptions = {
      nameTitle: 'Campaign',
      descriptionTitle: 'Description',
    };
  }

  addCampaign() {
    console.log('Adding new campaign');
  }

  onSelectedItemsChanged(items: string[]) {
    this.selectedCampaigns = items;
  }

  onFiltersChanged(filters: PeDataGridFilterItem[]): void {
    this.selectedFilters = filters;
  }

  onSearchChanged(searchString: string) {
    this.searchString = searchString;
  }

  private getFilteredCampaigns(campaigns, selectedFilters, searchString, selectedSort) {
    const searchRegexp = new RegExp(searchString, 'i');

    const filteredCampaigns = (!selectedFilters || selectedFilters.length === 0)
      ? [...campaigns]
      : campaigns.filter(cmp => cmp.labels && cmp.labels.includes(selectedFilters[0].key));

    const filteredBySearch = searchString
      ? filteredCampaigns.filter(campaign => searchRegexp.test(campaign.title))
      : [...filteredCampaigns];

    return selectedSort
      ? this.sortByStringField(filteredBySearch, selectedSort.field, selectedSort.asc)
      : filteredBySearch;
  }

  private onOpenCampaign(campaignId: string) {
    console.log(`open campaign: ${campaignId}`);
  }

  private onDelete(campaignIds: string[]) {
    this.api.deleteCampaigns(campaignIds);
    this.campaignsUpdatedSubject$.next(null);
    this.selectedCampaigns = [];
  }

  private sortByStringField(array: any[], field: string, asc: boolean = true) {
    return array.sort((a, b) => {
      if (asc) {
        return (a[field].toLowerCase() > b[field].toLowerCase())
          ? 1
          : (a[field].toLowerCase() < b[field].toLowerCase())
            ? -1
            : 0;
      } else {
        return (a[field].toLowerCase() < b[field].toLowerCase())
          ? 1
          : (a[field].toLowerCase() > b[field].toLowerCase())
            ? -1
            : 0;
      }
    });
  }
}

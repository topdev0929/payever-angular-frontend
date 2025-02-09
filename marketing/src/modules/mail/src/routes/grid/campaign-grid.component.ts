import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { MessageBus, PebEnvService } from '@pe/builder-core';
import { PebEditorApi } from '@pe/builder-api';
import { PePlatformHeaderService } from '@pe/platform-header';
import {
  PeDataGridAdditionalFilter,
  PeDataGridFilter,
  PeDataGridFilterItem,
  PeDataGridItem,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSidebarHeader,
  PeDataGridNavbarAdditionalButton,
  PeDataGridNewEntityOption,
} from '@pe/data-grid';

import { AbstractComponent } from '../../misc/abstract.component';
import { Router } from '@angular/router';

@Component({
  selector: 'peb-campaign-grid',
  templateUrl: './campaign-grid.component.html',
  styleUrls: ['./campaign-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebCampaignGridComponent extends AbstractComponent
  implements OnInit, AfterViewInit {
  showSidebar = true;

  skeletonThemes = Array.from({ length: 3 });
  shops: any;

  defaultShopSubject = new BehaviorSubject<any>(null);

  private columnsSubject$ = new BehaviorSubject<number>(3);
  columns$: Observable<number> = this.columnsSubject$.asObservable();
  items: PeDataGridItem[] = [
    {
      id: '1',
      image: 'https://picsum.photos/id/870/536/354?grayscale',
      title: 'Campaign 1',
      subtitle: '2 subscribers',
      description: '',
      selected: false,
      chips: ['Not saved', 'Draft'],
    },
    {
      id: '2',
      image: 'https://picsum.photos/id/870/536/354?grayscale',
      title: 'Campaign 2',
      subtitle: '2 subscribers',
      description: 'Description',
      selected: false,
    },
    {
      id: '3',
      image: 'https://picsum.photos/id/870/536/354?grayscale',
      title: 'Campaign 3',
      subtitle: '2 subscribers',
      description: '',
      selected: false,
      chips: ['Not saved'],
    },
    {
      id: '4',
      image: 'https://picsum.photos/id/870/536/354?grayscale',
      title: 'Campaign 3',
      subtitle: '2 subscribers',
      description: '',
      selected: false,
      chips: ['Not saved'],
    },
    {
      id: '5',
      image: 'https://picsum.photos/id/870/536/354?grayscale',
      title: 'Campaign 3',
      subtitle: '2 subscribers',
      description: '',
      selected: false,
      chips: ['Not saved'],
    },
  ];

  filters: any[] = [
    {
      title: 'All',
      items: [],
      active: false,
      icon: 'mail',
      single: true,
    },
    {
      title: 'Drafts',
      items: [],
      active: false,
      icon: 'drafts',
      single: true,
    },
    {
      title: 'Sent',
      items: [],
      active: false,
      icon: 'sent',
      single: true,
    },
  ];

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: 'Select all',
      callback: () =>
        (this.selectedCampaigns = this.items.map((p: any) => p.id)),
    },
    {
      label: 'Deselect all',
      callback: () => (this.selectedCampaigns = []),
    },
    {
      label: 'Apply',
      callback: () => {},
    },
    {
      label: 'Close',
      callback: () => {},
    },
  ];

  firstCardAction: PeDataGridSingleSelectedAction = {
    label: 'Open',
    callback: (id: string) => this.messageBus.emit('campaign.create', id),
  };

  sidebarHeader: PeDataGridSidebarHeader = {
    title: 'Campaigns',
    buttonTitle: 'Add',
    buttonCallback: () => this.messageBus.emit('campaign.create', null),
  };

  navbarAdditionalButton: PeDataGridNavbarAdditionalButton = {
    title: 'Create group',
    callback: () => this.messageBus.emit('campaign.create-group', null),
  };

  newEntityOption: PeDataGridNewEntityOption = {
    title: 'New Campaign',
    icon: 'campaign',
    callback: () => this.messageBus.emit('campaign.create', null),
  };

  private readonly selectedCampaignsSubject$ = new BehaviorSubject<string[]>(
    [],
  );
  selectedCampaigns$ = this.selectedCampaignsSubject$.asObservable();
  set selectedCampaigns(ids: string[]) {
    this.selectedCampaignsSubject$.next(ids);
  }

  @ViewChild('grid') grid: ElementRef;

  constructor(
    private api: PebEditorApi,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    @Optional() private platformHeader: PePlatformHeaderService,
    private envService: PebEnvService,
    private router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.platformHeader?.setShortHeader({
      title: 'Campaign list',
    });

    // this.api.getShops().pipe(
    //   tap(shops => {
    //     this.shops = shops;
    //     this.defaultShopSubject.next(shops.find((shop) => shop.isDefault));
    //     this.envService.shopId = shops.find((shop) => shop.isDefault)?.id;
    //     if (this.envService.shopId) {
    //       this.envService.shopId = shops[0].id;
    //     }
    //     this.cdr.markForCheck();
    //   }),
    //   share(),
    //   takeUntil(this.destroyed$),
    // ).subscribe();
  }

  onOpen(shop: any) {
    this.messageBus.emit('campaign.open', shop);
    this.platformHeader?.setFullHeader();
  }

  onEdit(shopId: string) {
    this.messageBus.emit('campaign.edit', shopId);
  }

  onResize(e) {
    this.updateColumns();
  }

  ngAfterViewInit() {
    this.updateColumns();
    this.cdr.detectChanges();
  }

  updateColumns() {
    // const columns = Math.floor(this.grid.nativeElement.offsetWidth / 323);
    // this.columnsSubject$.next(columns);
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    setTimeout(() => this.updateColumns(), 500);
  }

  onSelectedItemsChanged(items) {
    this.selectedCampaigns = items;
  }

  onFiltersChanged(e) {
    console.log(e);
  }
}

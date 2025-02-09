import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { SelectSnapshot } from "@ngxs-labs/select-snapshot";
import { BehaviorSubject } from "rxjs";

import { PeDataGridSortByActionIcon } from "@pe/common";
import {
  PeDataToolbarOptionIcon,
  PeGridMenu,
  PeGridTableDisplayedColumns,
  PeGridView,
} from "@pe/grid";
import { TranslateService } from "@pe/i18n-core";
import { BusinessState } from "@pe/user";

import {
  ShareLinkCellComponent,
  StatusComponent,
} from "../components";
import { FiltersFieldType } from "../interfaces";

enum OptionsMenu {
  SelectAll = 'select-all',
  DeselectAll = 'deselect-all',
  Duplicate = 'duplicate',
  Delete = 'delete'
}

export interface ToolbarMenuInterface {
  optionsMenu: PeGridMenu,
  sortMenu: PeGridMenu,
}

@Injectable()
export class PaymentLinkGridOptionsService {
  constructor(
    private translateService: TranslateService,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) { }

  @SelectSnapshot(BusinessState.businessUuid) private businessId: string;

  public toolbar: ToolbarMenuInterface = {
    optionsMenu: {
      title: this.translateService.translate('builder-themes.overlay.options'),
      items: [
        {
          label: this.translateService.translate('builder-themes.actions.select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('builder-themes.actions.deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('builder-themes.actions.duplicate'),
          value: OptionsMenu.Duplicate,
          defaultIcon: PeDataToolbarOptionIcon.Duplicate,
        },
        {
          label: this.translateService.translate('builder-themes.actions.delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('paymentLinks.sort.title'),
      items: [
        {
          label: this.translateService.translate('paymentLinks.sort.date_late'),
          value: 'createdAt.desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
          active: true,
        },
        {
          label: this.translateService.translate('paymentLinks.sort.date_early'),
          value: 'createdAt.asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('paymentLinks.sort.amount_high'),
          value: 'amount.desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('paymentLinks.sort.amount_low'),
          value: 'amount.asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
      ],
    },
  };

  public getDisplayedColumns(view: PeGridView): PeGridTableDisplayedColumns[] {
    return [
      {
        name: FiltersFieldType.PaymentLink,
        title: this.translateService.translate(`paymentLinks.columns.labels.shareLink`),
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.PaymentLink, true, view),
        cellComponentFactory: this.componentFactoryResolver.resolveComponentFactory(ShareLinkCellComponent),
        widthCellForMobile: '100px',
        minCellWidth: '10px',
        disabled: true,
      },
      {
        name: FiltersFieldType.ID,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.ID, true, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.ID}`),
        widthCellForMobile: '120px',
        disabled: true,
      },
      {
        name: FiltersFieldType.Amount,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.Amount, true, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.Amount}`),
        widthCellForMobile: '120px',
        disabled: true,
      },
      {
        name: FiltersFieldType.CreatedAt,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.CreatedAt, true, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.CreatedAt}`),
        widthCellForMobile: '120px',
      },
      {
        name: FiltersFieldType.CreatorName,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.CreatorName, false, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.CreatorName}`),
        widthCellForMobile: '120px',
      },
      {
        name: FiltersFieldType.ExpiresAt,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.ExpiresAt, true, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.ExpiresAt}`),
        widthCellForMobile: '120px',
      },
      {
        name: FiltersFieldType.Views,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.Views, true, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.Views}`),
        widthCellForMobile: '120px',
      },
      {
        name: FiltersFieldType.Transactions,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.Transactions, true, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.Transactions}`),
        widthCellForMobile: '120px',
      },
      {
        name: FiltersFieldType.Status,
        selected$: this.makeBehaviorSubjectWithStorage(FiltersFieldType.Status, true, view),
        title: this.translateService.translate(`paymentLinks.columns.labels.${FiltersFieldType.Status}`),
        widthCellForMobile: '120px',
        cellComponentFactory: this.componentFactoryResolver.resolveComponentFactory(StatusComponent),
        disabled: true,
      },
    ];
  }

  private makeBehaviorSubjectWithStorage(baseKey: string, defaultValue: boolean, view: PeGridView): BehaviorSubject<boolean> {
    const key = `pe.payment-links.${this.businessId}.${view}.customFields.columns.${baseKey}`;
    let result = new BehaviorSubject<boolean>(defaultValue);
    try {
      if (sessionStorage?.getItem(key)) {
        result = new BehaviorSubject(sessionStorage.getItem(key) === 'true');
      }
    } catch (e) { }
    result.subscribe((value) => {
      try {
        sessionStorage?.setItem(key, value ? 'true' : 'false');
      } catch (e) { }
    });

    return result;
  }
}

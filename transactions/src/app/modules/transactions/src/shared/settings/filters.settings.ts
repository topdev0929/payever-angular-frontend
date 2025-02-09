import { DataGridFilterSchemaInterface, DataGridFilterType } from '@pe/ng-kit/modules/data-grid';

import { FiltersFieldType, FiltersOptionsSourcesType, StatusType } from '../interfaces';

export interface TransactionsFilterSchemaInterface extends DataGridFilterSchemaInterface {
  optionsSource?: FiltersOptionsSourcesType;
  multiselect?: boolean;
}

export const filtersList: TransactionsFilterSchemaInterface[] = [
  {
    field: FiltersFieldType.OriginalId,
    fieldLabel: `form.filter.labels.${FiltersFieldType.OriginalId}`,
    type: DataGridFilterType.Text,
    multiselect: true
  },
  {
    field: FiltersFieldType.Reference,
    fieldLabel: `form.filter.labels.${FiltersFieldType.Reference}`,
    type: DataGridFilterType.Text,
    multiselect: true
  },
  {
    field: FiltersFieldType.CreatedAt,
    fieldLabel: `form.filter.labels.${FiltersFieldType.CreatedAt}`,
    type: DataGridFilterType.Date,
    multiselect: true
  },
  {
    field: FiltersFieldType.Type,
    fieldLabel: `form.filter.labels.${FiltersFieldType.Type}`,
    type: DataGridFilterType.Select,
    options: [],
    optionsSource: FiltersOptionsSourcesType.PaymentMethods,
    multiselect: true
  },
  {
    field: FiltersFieldType.Status,
    fieldLabel: `form.filter.labels.${FiltersFieldType.Status}`,
    type: DataGridFilterType.Select,
    options: [],
    optionsSource: FiltersOptionsSourcesType.Statuses,
    multiselect: true
  },
  {
    field: FiltersFieldType.SpecificStatus,
    fieldLabel: `form.filter.labels.${FiltersFieldType.SpecificStatus}`,
    type: DataGridFilterType.Select,
    options: [],
    optionsSource: FiltersOptionsSourcesType.SpecificStatuses,
    multiselect: true
  },
  {
    field: FiltersFieldType.Channel,
    fieldLabel: `form.filter.labels.${FiltersFieldType.Channel}`,
    type: DataGridFilterType.Select,
    options: [],
    optionsSource: FiltersOptionsSourcesType.Channels,
    multiselect: true
  },
  {
    field: FiltersFieldType.Amount,
    fieldLabel: `form.filter.labels.${FiltersFieldType.Amount}`,
    type: DataGridFilterType.Number,
    multiselect: true
  },
  {
    field: FiltersFieldType.Total,
    fieldLabel: `form.filter.labels.${FiltersFieldType.Total}`,
    type: DataGridFilterType.Number,
    multiselect: true
  },
  {
    field: FiltersFieldType.Currency,
    fieldLabel: `form.filter.labels.${FiltersFieldType.Currency}`,
    type: DataGridFilterType.Select,
    options: [],
    optionsSource: FiltersOptionsSourcesType.Currencies,
    multiselect: true
  },
  {
    field: FiltersFieldType.CustomerName,
    fieldLabel: `form.filter.labels.${FiltersFieldType.CustomerName}`,
    type: DataGridFilterType.Text,
    multiselect: true
  },
  {
    field: FiltersFieldType.CustomerEmail,
    fieldLabel: `form.filter.labels.${FiltersFieldType.CustomerEmail}`,
    type: DataGridFilterType.Email,
    multiselect: true
  },
  {
    field: FiltersFieldType.MerchantName,
    fieldLabel: `form.filter.labels.${FiltersFieldType.MerchantName}`,
    type: DataGridFilterType.Text,
    multiselect: true
  },
  {
    field: FiltersFieldType.MerchantEmail,
    fieldLabel: `form.filter.labels.${FiltersFieldType.MerchantEmail}`,
    type: DataGridFilterType.Email,
    multiselect: true
  },
  {
    field: FiltersFieldType.SellerName,
    fieldLabel: `form.filter.labels.${FiltersFieldType.SellerName}`,
    type: DataGridFilterType.Text,
    multiselect: true
  },
  {
    field: FiltersFieldType.SellerEmail,
    fieldLabel: `form.filter.labels.${FiltersFieldType.SellerEmail}`,
    type: DataGridFilterType.Email,
    multiselect: true
  }
];

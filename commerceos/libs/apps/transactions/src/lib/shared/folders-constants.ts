import moment from 'moment';

import { PeFilterConditions } from '@pe/grid/shared';
import { FolderItem } from '@pe/shared/folders';

import { TransactionsStatusEnum } from './enums';
import { FiltersFieldType } from './interfaces';

export const DEFAULT_FOLDERS_VALUE = 'DEFAULT_FOLDERS_VALUE';

export const defaultFolders: FolderItem[] = [
  {
    isHeadline: true,
    _id: 'status',
    name: 'transactions.values.filter_labels.status',
    position: 1,
    isExpanded: true,
    isProtected: true,
    children: [
      {
        name: 'transactions.values.statuses.STATUS_PAID',
        _id: 'paid',
        position: 2,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.Status,
            contain: PeFilterConditions.Is,
            search: TransactionsStatusEnum.STATUS_PAID,
            disableRemoveOption: true,
          },
        },
      },
      {
        name: 'transactions.values.statuses.STATUS_IN_PROCESS',
        _id: 'inProgress',
        position: 2,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.Status,
            contain: PeFilterConditions.Is,
            search: TransactionsStatusEnum.STATUS_IN_PROCESS,
            disableRemoveOption: true,
          },
        },
      },
      {
        name: 'transactions.values.statuses.STATUS_ACCEPTED',
        _id: 'accepted',
        position: 2,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.Status,
            contain: PeFilterConditions.Is,
            search: TransactionsStatusEnum.STATUS_ACCEPTED,
            disableRemoveOption: true,
          },
        },
      },
      {
        name: 'transactions.values.statuses.STATUS_CANCELLED',
        _id: 'cancelled',
        position: 2,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.Status,
            contain: PeFilterConditions.Is,
            search: TransactionsStatusEnum.STATUS_CANCELLED,
            disableRemoveOption: true,
          },
        },
      },
    ],
  },
  {
    isHeadline: true,
    _id: 'time',
    name: 'transactions.values.filter_labels.time',
    position: 2,
    isExpanded: true,
    isProtected: true,
    children: [
      {
        name: 'transactions.values.times.TODAY',
        _id: 'Today',
        position: 2,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.CreatedAt,
            contain: PeFilterConditions.IsDate,
            search: moment().toDate(),
            disableRemoveOption: true,
          },
        },
      },
      {
        name: 'transactions.values.times.LAST_WEEK',
        _id: 'week',
        position: 3,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.CreatedAt,
            contain: PeFilterConditions.BetweenDates,
            search: { from: moment().subtract(1, 'weeks').toDate(), to: moment().toDate() },
            disableRemoveOption: true,
          },
        },
      },
      {
        name: 'transactions.values.times.LAST_MONTH',
        _id: 'month',
        position: 4,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.CreatedAt,
            contain: PeFilterConditions.BetweenDates,
            search: { from: moment().subtract(1, 'months').toDate(), to: moment().toDate() },
            disableRemoveOption: true,
          },
        },
      },
    ],
  },
  {
    isHeadline: true,
    _id: 'channel',
    name: 'transactions.values.filter_labels.channel',
    position: 3,
    isExpanded: true,
    isProtected: true,
    children: [
      {
        name: 'integrations.payments.pos.title',
        _id: 'pos',
        position: 2,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.Channel,
            contain: PeFilterConditions.Is,
            search: 'pos',
            disableRemoveOption: true,
          },
        },
      },
      {
        name: 'integrations.shopsystems.link.title',
        _id: 'link',
        position: 3,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.Channel,
            contain: PeFilterConditions.Is,
            search: 'link',
            disableRemoveOption: true,
          },
        },
      },
      {
        name: 'integrations.shopsystems.shop.title',
        _id: 'shop',
        position: 4,
        isProtected: true,
        data: {
          key: DEFAULT_FOLDERS_VALUE,
          value: {
            filter: FiltersFieldType.Channel,
            contain: PeFilterConditions.Is,
            search: 'shop',
            disableRemoveOption: true,
          },
        },
      },
    ],
  },
];

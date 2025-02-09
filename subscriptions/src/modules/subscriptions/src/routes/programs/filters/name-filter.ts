import { PeDataGridFilterConditionType, PeDataGridFilterWithConditions } from '@pe/common';

export enum DataGridTextFilterConditionType {
  Is = 'is',
  IsNot = 'isNot',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
}

export const nameFilter: PeDataGridFilterWithConditions = {
  filterName: 'Name',
  filterKey: 'name',
  type: PeDataGridFilterConditionType.Text,
  expanded: true,
  conditions: Object.keys(DataGridTextFilterConditionType).map(key => ({
    conditionLabel: DataGridTextFilterConditionType[key],
    conditionValue: DataGridTextFilterConditionType[key],
    conditionFields: [
      {
        label: 'Search',
        inputValue: '',
      },
    ],
  })),
  applyFilter: (data: any) => {
    console.log('applyFilter:', data);
  },
};

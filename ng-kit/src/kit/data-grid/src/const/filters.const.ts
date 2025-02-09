import { DataGridFilterCondition, DataGridFilterInterface } from '../interfaces';

export namespace DataGridDefaultFilterConditions {
  export const number: DataGridFilterCondition[] = [
    DataGridFilterCondition.Is,
    DataGridFilterCondition.IsNot,
    DataGridFilterCondition.GreaterThan,
    DataGridFilterCondition.LessThan,
    DataGridFilterCondition.Between
  ];
  export const date: DataGridFilterCondition[] = [
    DataGridFilterCondition.IsDate,
    DataGridFilterCondition.IsNotDate,
    DataGridFilterCondition.AfterDate,
    DataGridFilterCondition.BeforeDate,
    DataGridFilterCondition.BetweenDates
  ];
  export const select: DataGridFilterCondition[] = [
    DataGridFilterCondition.Is,
    DataGridFilterCondition.IsNot,
  ];
  export const text: DataGridFilterCondition[] = [
    DataGridFilterCondition.Is,
    DataGridFilterCondition.IsNot,
    DataGridFilterCondition.StartsWith,
    DataGridFilterCondition.EndsWith,
    DataGridFilterCondition.Contains,
    DataGridFilterCondition.DoesNotContain
  ];
}

export class DataGridDefaultFilterFactory {

  static number(key: string): DataGridFilterInterface {
    return {
      key,
      condition: DataGridFilterCondition.Is,
      value: ''
    };
  }

  static date(key: string): DataGridFilterInterface {
    return {
      key,
      condition: DataGridFilterCondition.IsDate,
      value: ''
    };
  }

  static select(key: string): DataGridFilterInterface {
    return{
      key,
      condition: DataGridFilterCondition.Is,
      value: ''
    };
  }

  static text(key: string): DataGridFilterInterface {
    return {
      key,
      condition: DataGridFilterCondition.Is,
      value: ''
    };
  }
}

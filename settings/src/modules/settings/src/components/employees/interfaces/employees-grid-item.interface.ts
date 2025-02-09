import { PeDataGridItem } from '@pe/common';
import { EmployeesGridItemDataInterface } from './employees-grid-item-data.interface';

export interface EmployeesGridItemInterface extends Omit<PeDataGridItem, 'data'> {
  data?: EmployeesGridItemDataInterface;
  labels?: string[];
}

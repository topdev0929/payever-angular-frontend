import { PositionsEnum } from '../../../misc/enum/positions.enum';

export interface PositionTreeDataInterface {
  isFolder: boolean;
  category: PositionsEnum;
  param: string;
}

export interface GroupTreeDataInterface {
  isFolder: boolean;
  category: string;
  param: string;
}

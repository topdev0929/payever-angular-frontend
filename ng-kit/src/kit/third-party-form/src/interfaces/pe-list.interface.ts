import { OperationInterface, OperationButtonInterface } from './action-button.interface';

export enum PeListCellType {
  Text = 'text',
  Image = 'image',
  Iframe = 'iframe',
  Button = 'button',
  Toggle = 'toggle',
}

interface PeListCellBasicInterface {
  classes?: string;
}

export interface PeListCellValueInterface extends PeListCellBasicInterface {
  type: PeListCellType.Text | PeListCellType.Image;
  value: string;
}

export interface PeListCellButtonInterface extends PeListCellBasicInterface, OperationButtonInterface {
  type: PeListCellType.Button;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  color?: string;
}

export interface PeListCellToggleInterface extends PeListCellBasicInterface {
  type: PeListCellType.Toggle;
  actionOn: string;
  actionOff: string;
  requestOn: {
    url: string,
    method: string
  };
  requestOff: {
    url: string,
    method: string
  };
  checked: boolean;
}

export type PeListCellInterface = PeListCellValueInterface | PeListCellButtonInterface | PeListCellToggleInterface;
export type PeListInterface = PeListCellInterface[][];

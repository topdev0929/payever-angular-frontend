import { ComponentFactory } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { GridSkeletonColumnType, GridTitleImageStyle } from '../enums';

export enum PeGridItemType {
  Item = 'item',
  Folder = 'folder'
}

export interface PeGridItemColumn {
  name: string;
  value: string;
  className?: string;
  label?: string;
  customStyles?: {
    [key: string]: string
  }
}

export interface PeGridItem<RawData = any> {
  /** required */
  id: string;
  title: string;
  type: PeGridItemType;
  columns: PeGridItemColumn[];
  image: string;
  /** optional */
  useDefaultImage?: boolean;
  isLoading$?: BehaviorSubject<boolean>;
  initialLoading?: boolean;
  basic?: boolean;
  action?: {
    label: string;
    backgroundColor?: string;
    color?: string;
    more?: boolean;
    disabled?: boolean;
  };
  badge?: {
    backgroundColor: string;
    color: string;
    label?: string;
    componentCell?: any;
    cellComponentFactory?: ComponentFactory<any>;
  };
  disabledMenuItems?: {
    disable: boolean;
    value: any;
  }[];
  hideMenuItems?: {
    hide: boolean;
    value: any;
  }[];
  thumbnail?: {
    image?: string;
    componentCell?: any;
    cellComponentFactory?: ComponentFactory<any>;
  }
  serviceEntityId?: string;
  icon?: string;
  resize$?: Subject<boolean>;
  description?: string;
  isDraggable?: boolean;
  data?: RawData;
  additionalInfo?: string[];
  itemLoader$?: BehaviorSubject<boolean>;
}

export interface PeGridAddItem {
  addGridItem: boolean;
}

export interface PeGridTableDisplayedColumns {
  data?: PeGridItemColumnData;
  name: string;
  title: string;
  cellComponent?: any; // TODO Add base interface
  cellComponentFactory?: ComponentFactory<any>; // TODO Add base interface
  selected$?: BehaviorSubject<boolean>;
  disabled?: boolean;
  widthCellForMobile?: string; // Will work with PeGridView.TableWithScroll
  widthCellForMobile$?: BehaviorSubject<number>; // Will work with PeGridView.TableWithScroll
  skeletonColumnType?: GridSkeletonColumnType;
  positionForMobile?: number;
  placeholderCondition?: (value: string) => boolean;
  minCellWidth?: string;
}

export interface PeGridItemColumnData {
  titleImageStyle: GridTitleImageStyle;
}

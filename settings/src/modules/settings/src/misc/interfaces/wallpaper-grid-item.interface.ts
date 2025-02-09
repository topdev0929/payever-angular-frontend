import { PeDataGridItem } from '@pe/common';

export interface WallpaperGridItemInterface extends Omit<PeDataGridItem, 'data'> {
  data?: any;
  position?: any;
}

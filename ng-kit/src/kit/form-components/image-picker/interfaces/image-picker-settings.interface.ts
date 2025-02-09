import { HttpErrorResponse } from '@angular/common/http';

import { MediaContainerType } from '../../../media';
import { DescriptionAlignment, ImagePickerAlignment, ImagePickerStyle } from '../enums';
import { ImagePickerChangeEvent } from './image-picker-change-event.interface';

export interface ImagePickerSettingsInterface {
  alignment?: ImagePickerAlignment;
  businessUuid?: string;
  container?: MediaContainerType;
  description?: string;
  descriptionAlignment?: DescriptionAlignment;
  loading?: boolean;
  onDeleteRequestError?: (error: HttpErrorResponse) => void;
  onUploadRequestError?: (error: HttpErrorResponse) => void;
  onValueChange?: (event: ImagePickerChangeEvent) => void;
  placeholder?: string;
  uploadProgress?: number;
  preventDeleteRequest?: boolean;
  style?: ImagePickerStyle;
}

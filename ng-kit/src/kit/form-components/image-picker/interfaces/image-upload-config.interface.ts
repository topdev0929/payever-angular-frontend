import { MediaContainerType } from '../../../media';

export interface ImageUploadConfigInterface {
  businessId: string;
  container: MediaContainerType;
  checkImage: boolean;
  showErrors: boolean;
}

export interface ImageUploadWithFileConfigInterface extends ImageUploadConfigInterface {
  file: File;
}

interface SkinProviderMetadataInterface {
  filename: string;
}

export interface SkinFormatInterface {
  format?: string;
  url?: string;
  alt?: string;
  title?: string;
  width?: string;
  height?: string;
}

export interface SkinSourcesInterface {
  small?: SkinFormatInterface;
  reference?: SkinFormatInterface;
  thumb?: SkinFormatInterface;
}

export interface SkinMediaInterface {
  uuid?: string;
  id?: string;
  name?: string;
  description?: string;
  provider_name?: string;
  provider_status?: string;
  provider_reference?: string;
  provider_metadata?: SkinProviderMetadataInterface;
  context?: string;
  updated_at?: string;
  created_at?: string;
  content_type?: string;
  sources: SkinSourcesInterface;
  tags?: string[];
}

export interface SkinInterface {
  uuid: string;
  media: SkinMediaInterface;
  created_at?: string;
  type?: string;
  active?: boolean;
}

export interface SkinEventInterface {
  uuid: string;
  isPreset: boolean;
  isPresetRemoveEnabled?: boolean;
}

export interface SkinUploadEventInterface {
  file: File;
  isPreset: boolean;
}

export interface SkinWidgetConfigInterface {
  close: string;
  addImage: string;
  uploadBtn: {
    uploading: string;
    fail: string;
    retry: string;
  };
}

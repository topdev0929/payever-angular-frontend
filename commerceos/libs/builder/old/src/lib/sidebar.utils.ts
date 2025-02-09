
import { PebPageVariant, SelectOption } from '@pe/builder/core';


export enum AlignType {
  Left = 'Left',
  Center = 'Center',
  Right = 'Right',
  Top = 'Top',
  Middle = 'Middle',
  Bottom = 'Bottom',
}

export const ALIGN_TYPES: SelectOption[][] = [
  [
    { value: AlignType.Left, name: 'Left' },
    { value: AlignType.Center, name: 'Center' },
    { value: AlignType.Right, name: 'Right' },
  ],
  [
    { value: AlignType.Top, name: 'Top' },
    { value: AlignType.Middle, name: 'Middle' },
    { value: AlignType.Bottom, name: 'Bottom' },
  ],
];

export interface BgGradient {
  angle: number;
  startColor: string;
  start: number;
  endColor: string;
  end: number;
}


export const PageVariants: SelectOption[] = [
  { value: PebPageVariant.Default, name: 'Default' },
  { value: PebPageVariant.Category, name: 'Category' },
  { value: PebPageVariant.Product, name: 'Product' },
  { value: PebPageVariant.Login, name: 'Login' },
  { value: PebPageVariant.Password, name: 'Password' },
  { value: PebPageVariant.NotFound, name: '404' },
  { value: PebPageVariant.Partial, name: 'Partial' },
];

export enum FillType {
  None = 'None',
  ColorFill = 'Color fill',
  ImageFill = 'Image fill',
  GradientFill = 'Gradient fill',
  Video = 'Video',
}

export const FillTypes: SelectOption[] = [
  { name: FillType.None },
  { name: FillType.ColorFill },
  { name: FillType.ImageFill },
  { name: FillType.GradientFill },
];
export const getFillType = (type: string) => FillTypes.find(option => option.name === type);

export enum ImageSize {
  Initial = 'initial',
  Contain = 'contain',
  Cover = 'cover',
  Stretch = '100% 100%',
  OriginalSize = 'auto',
}

export enum VideoSize {
  Contain = 'contain',
  Cover = 'cover',
  Stretch = 'fill',
  OriginalSize = 'none',
}

export const ImageSizes: SelectOption[] = [
  { value: ImageSize.OriginalSize, name: 'Original Size', icon: 'fill-original' },
  { value: ImageSize.Stretch, name: 'Stretch', icon: 'fill-stretch'  },
  { value: ImageSize.Initial, name: 'Tile', icon: 'fill-tile'  },
  { value: ImageSize.Cover, name: 'Scale to Fill', icon: 'fill-fill'  },
  { value: ImageSize.Contain, name: 'Scale to Fit', icon: 'fill-fit'  },
];

export const VideoSizes: SelectOption[] = [
  { value: VideoSize.OriginalSize, name: 'Original Size' },
  { value: VideoSize.Stretch, name: 'Stretch' },
  { value: VideoSize.Cover, name: 'Scale to Fill' },
  { value: VideoSize.Contain, name: 'Scale to Fit' },
];

export const PageSidebarDefaultOptions = {
  BgColor: '#ffffff',
  PageType: PageVariants[0],
  FillType: FillTypes[0],
  ImageSize: ImageSizes[0],
  ImageScale: 100,
  VideoSize: VideoSizes[3],
  videoScale: 100,
};

export function getSelectedOption(
  options: SelectOption[],
  value: string | number | undefined,
  defaultValue: SelectOption,
): SelectOption {
  if (!value) {
    return defaultValue;
  }

  return options.find(option => option.value === String(value)) || defaultValue;
}

export function asyncGetVideoDimensions(video: HTMLVideoElement) {
  return new Promise<any>((resolve) => {
    if (video) {
      if (video.videoWidth) {
        const { videoWidth, videoHeight } = video;
        resolve({ videoWidth, videoHeight });
      } else {
        video.addEventListener('loadedmetadata', () => {
          const { videoWidth, videoHeight } = video;
          resolve({ videoWidth, videoHeight });
        });
      }
    } else {
      resolve({ videoWidth: '100%', videoHeight: '100%' });
    }

  });
}

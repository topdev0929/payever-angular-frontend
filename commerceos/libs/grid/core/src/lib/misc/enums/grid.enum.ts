export enum GridQueryParams {
  ScrollTop = 'scrollTop',
  Page = 'page',
  OpenPreview = 'preview',
  View = 'view',
  SelectedFolder = 'folder'
}

export function getPaginationResult() {
  if (window.innerWidth <= 1000) {
    return 15;
  }
  if (window.innerWidth > 1000 && window.innerWidth < 2000) {
    return 40;
  }

  return 70;
}

export enum GridTitleImageStyle {
  Rounded = 'rounded',
  Circle = 'circle',
}

export enum GridSkeletonColumnType {
  Square = 'square',
  Line = 'line',
  Ellipse = 'ellipse',
  Rectangle = 'rectangle',
  Thumbnail = 'thumbnail',
  ThumbnailWithName = 'thumbnail-with-name',
  ThumbnailCircleWithName = 'thumbnail-circle-with-name'
}

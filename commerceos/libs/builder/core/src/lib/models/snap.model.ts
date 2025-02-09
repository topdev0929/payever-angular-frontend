export interface PebSnapLine {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  applied?: boolean;
  joints?: { x: number, y: number }[];
  transform?: PebSnapTransform;
  distance: number,
  weight: number,
  center: boolean;
}

export interface PebSnapPoint {
  type: 'corner' | 'center';
  x: number;
  y: number;
  peerX: number;
  peerY: number;
}

export interface PebSnapTransform {
  moveX?: number;
  moveY?: number;
  resizeX?: number;
  resizeY?: number;
}

export interface PebSnapTransformOption {
  move?: {
    top?: boolean,
    right?: boolean,
    bottom?: boolean,
    left?: boolean,
    center?: boolean;
  },
  resize?: {
    top?: boolean,
    right?: boolean,
    bottom?: boolean,
    left?: boolean,
  },
  viewGap?: number,
  applyGap?: number,
}

import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { BBox } from 'rbush';

import { PebShop } from './client';

export const PEB_EDITOR_MIN_ZOOM = 0.02;
export const PEB_EDITOR_MAX_ZOOM = 16;

export interface PebShopThemeVersion {
    id: string;
    name: string;
    result: PebShop;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
    tags: string[];
}

export interface SelectOption {
    name: string;
    style?: string;
    value?: any;
    icon?: string;
}

export interface PebEditorLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface PebEditorPoint {
    x: number;
    y: number;
}

export interface PebEditorViewport {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    containerWidth: number;
    containerHeight: number;
    page: { width: number; height: number, originalWidth: number, originalHeight: number };
    scale: number;
    totalArea: BBox;
}

export interface PebEditorScale {
    scaleX: number;
    scaleY: number;
}

export const PEB_DEFAULT_VIEWPORT: PebEditorViewport = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    containerWidth: 0,
    containerHeight: 0,
    page: { width: 0, height: 0, originalWidth: 0, originalHeight: 0 },
    scale: 1,
    totalArea: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
};

export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
    },
    {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
    },
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
    },
    {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
    },
];

import { PebInteractionType, PebViewElementEventType } from '@pe/builder/core';

export const videoTriggers = [
  { name: 'Video Play', value: PebViewElementEventType.VideoPlay },
  { name: 'Video Pause', value: PebViewElementEventType.VideoPause },
];

export const videoActions = [
  { name: 'Video Play', value: PebInteractionType.VideoPlay },
  { name: 'Video Toggle Play', value: PebInteractionType.VideoTogglePlay },
  { name: 'Video Pause', value: PebInteractionType.VideoPause },
];

export const videoInitValue = {
  videoElementId: '',
  reset: false,
};
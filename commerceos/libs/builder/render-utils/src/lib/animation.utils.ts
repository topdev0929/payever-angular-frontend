import { PebAnimation } from '@pe/builder/core';

export function getGlobalKeyframeId(elementId: string, animation: PebAnimation, index: number): string {
  return `${getGlobalAnimationId(elementId, animation)}-k${index}`;
}

export function getGlobalAnimationId(elementId: string, animation: PebAnimation): string {
  return `anim-${elementId}-${animation.id}`;
}

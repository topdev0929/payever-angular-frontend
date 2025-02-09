import { ANIMATION_DELAY } from "./const";

export const delayedExecution = (delay: number = ANIMATION_DELAY) => {
  let animationTimeout: ReturnType<typeof setTimeout> | null = null;

  return (callback: () => void) => {
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    animationTimeout = setTimeout(() => {
      callback();
      animationTimeout = null;
    }, delay);
  };
};
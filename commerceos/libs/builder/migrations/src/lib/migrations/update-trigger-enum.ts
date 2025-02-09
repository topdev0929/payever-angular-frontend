import { PebMigration } from '../migrations.interface';

export const triggerEnumUpdate: PebMigration = async (elm: any) => {

  if (elm.animations) {
    Object.values(elm.animations).forEach((animation: any) => {
      const newKey = animationTriggerMap[animation.trigger];
      newKey && (animation.trigger = newKey);
    });
  }

  if (elm.interactions) {
    Object.values(elm.interactions).forEach((interaction: any) => {
      const newKey = interactionTriggerMap[interaction.trigger];
      newKey && (interaction.trigger = newKey);
    });
  }

  return elm;
};

const animationTriggerMap: { [old: string]: string } = {
  'mouse-enter': 'mouse.enter',
  'mouse-leave': 'mouse.leave',
  'view-port': 'viewport.enter',
  'scroll': 'page.scroll',
  'slide': 'slider.index-change',
};

const interactionTriggerMap: { [old: string]: string } = {
  'mouse-enter': 'mouse.enter',
  'mouse-leave': 'mouse-leave',
  'enter-viewport': 'viewport.enter',
  'exit-viewport': 'viewport.exit',
};

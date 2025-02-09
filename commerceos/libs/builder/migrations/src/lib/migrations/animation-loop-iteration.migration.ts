import { PebMigration } from '../migrations.interface';


export const animationLoopIteration: PebMigration = async (elm: any) => {
  const animations = elm.animations ?? [];
  
  for (const animation of animations) {
    if (!animation.infiniteLoop) {
      animation.infiniteLoop = false;
    }

    if (!animation.iteration) {
      animation.iteration = 1;
    }
  }

  return elm;
};


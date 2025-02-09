import { trigger, transition, style, animate } from '@angular/animations';

export const FadeInAnimation = trigger(
  'fadeInAnimation',
  [
    transition('void => *', [
      style({ opacity: 0 }),
      animate(500, style({ opacity: 1 })),
    ]),
  ],
);
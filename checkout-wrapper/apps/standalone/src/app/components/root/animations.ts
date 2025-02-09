import {
  trigger, state, style, transition, animate, group,
} from '@angular/animations';

export const slideInOutAnimation = [
  trigger('slideInOut', [
    state(
      'in',
      style({ opacity: '1', visibility: 'visible' })
    ),
    state(
      'out',
      style({ opacity: '0', visibility: 'hidden' })
    ),
    transition(
      'in => out',
      [
        group([
          animate(
            '440ms ease-in-out',
            style({ opacity: '0' })
          ),
          animate(
            '480ms ease-in-out',
            style({ visibility: 'hidden' })
          ),
        ]
      )]
    ),
    transition(
      'out => in',
      [group(
        [
          animate(
            '400ms ease-in-out',
            style({ visibility: 'visible' })
          ),
          animate(
            '440ms ease-in-out',
            style({ opacity: '1' })
          ),
        ]
      )]
    ),
  ]),
];

import { trigger, style, transition, animate } from '@angular/animations';

export const openOverlayAnimation = trigger('overlayAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.8)' , transformOrigin: 'center center' }),
    animate('120ms cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
  transition(':leave', [
    animate('100ms linear', style({ opacity: 0 })),
  ]),
]);

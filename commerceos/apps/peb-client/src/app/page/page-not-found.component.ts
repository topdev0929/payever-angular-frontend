import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
} from '@angular/core';

import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-client-page-not-found',
  template: `
      <div class="not-found">
          <div class="not-found__info">
            <div class="not-found__title">
              Error 404
            </div>
            <div class="not-found__subtitle">
              not found
            </div>
            <div class="not-found__button" (click)="goBack()">
              <span>Go back</span>
            </div>
            <span class="message">{{message}}</span>
          </div>
      </div>
  `,
  styleUrls: ['./page-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebClientPageNotFoundComponent {

  @Input() message!: string;

  constructor(
    public readonly elementRef: ElementRef,
    private location: Location,
  ) {
  }

  goBack(): void {
    this.location.back();
  }
}
import { Component } from '@angular/core';
import { CarouselService } from './carousel.service';

@Component({
  selector: 'pe-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['carousel.component.scss']
})

export class CarouselComponent {
  isOpen: boolean;

  constructor(private carouselService: CarouselService) {
    this.carouselService.carouselClosed$.subscribe(() => this.close());
    this.carouselService.carouselOpened$.subscribe(() => this.open());
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }
}

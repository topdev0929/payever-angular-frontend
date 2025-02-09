import {Component} from '@angular/core';
import { StoreSliderInterface } from '../../../../kit/store-slider';

@Component({
    selector: 'doc-store-slider',
    templateUrl: './store-slider-doc.component.html'
})
export class StoreSliderDocComponent {
    public isEditorVisible: boolean = false;
    slides: StoreSliderInterface[];
    isButtonsActive: boolean = false;
    isAutoRotateActive: boolean = false;
    isArrowsActive: boolean = false;

    constructor() {
      this.slides = [
        {
          src: 'https://stage.payever.de/dist/@pe/ui-kit/images/commerseos-background.jpg_ed4f73.jpg',
          alt: 'First slide'
        },
        {
          src: '/ui-kit/src/doc/assets/img/product-image-2_dad3e2.png',
          alt: 'Second slide'
        },
        {
          src: 'http://cit.h-cdn.co/assets/17/01/980x695/1483528451-central-park.jpg',
          alt: 'Third slide'
        },
        {
          src: '/ui-kit/src/doc/assets/img/product-image-4_ecaa7d.png',
          alt: 'Forth slide'
        }
      ];
    }

    public onShowEditorClick(): void {
        this.isEditorVisible = true;
    }

    public onEditorClosed(): void {
        this.isEditorVisible = false;
    }

    public onButtonsActiveChanged(isActive: boolean): void {
      
    }
    public onAutoRotateActiveChanged(isActive: boolean): void {
      
    }
    public onArrowsActiveChanged(isActive: boolean): void {
      
    }
}

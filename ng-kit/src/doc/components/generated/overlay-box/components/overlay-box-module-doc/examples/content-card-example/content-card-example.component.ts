import { Component } from '@angular/core';

@Component({
  selector: 'doc-content-card-example',
  templateUrl: 'content-card-example.component.html'
})
export class ContentCardExampleDocComponent {

  headingText: string;
  footerButtonText: string;
  nullImages: string[];
  images: string[];
  placeholderText: string;
  placeholderIcon: string;
  cardButtonText: string;

  ngOnInit(): void {
    this.headingText = 'Business';
    this.footerButtonText = '+ Add business';
    this.nullImages = [
      null,
      null,
    ];
    this.images = [
      'https://liquipedia.net/commons/images/e/e4/Frostbolt.png'
    ];
    this.placeholderIcon = '#icon-user-4-128';
    this.cardButtonText = 'Click';
  }

  onCardClick(): void {
    
  }

  onFooterClick(): void {
    
  }

}

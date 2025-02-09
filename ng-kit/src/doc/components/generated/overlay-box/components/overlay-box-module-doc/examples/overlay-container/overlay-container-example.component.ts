import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'doc-overlay-container',
  templateUrl: './overlay-container-example.component.html'
})
export class OverlayContainerExampleComponent {
  isFixed: boolean;
  isShow: boolean = false;
  items: any[];
  showSpinner: boolean = true;
  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  toggleShow(fixed: boolean): void {
    this.isShow = !this.isShow;
    this.isFixed = fixed;
  }

  fetchProducts(): void {
    let url: string = `https://stage.payever.de/products/api/v1/products?f%5Bbusiness%5D%5Bv%5D%5B%5D=b197bf22-6309-11e7-a2a8-5254008319f0&limit=12`;

    this.httpClient.get(url)
      .subscribe((products: any) => {
        this.items = products.collection;
        this.showSpinner = false;
      });
  }
}

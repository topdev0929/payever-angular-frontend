import { Component, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  DataViewModeType,
  DataGridAbstractComponent,
  DataGridFilterInterface,
  DataGridTableColumnInterface,
  DataGridSelectBarButtonInterface
} from '../../../../../../kit/data-grid';

export interface ProductInterface {
  images: string[];
  id: string;
  title: string;
  description: string;
  onSales: boolean;
  price: number;
  salePrice: number;
  vatRate: number;
  sku: string;
  barcode: string;
  currency: string;
  type: string;
  active: boolean;
}

@Component({
  selector: 'doc-data-grid-example',
  templateUrl: 'data-grid-example.component.html'
})
export class DataGridExampleDocComponent extends DataGridAbstractComponent<ProductInterface> {

  dataViewMode: typeof DataViewModeType = DataViewModeType;

  viewMode: DataViewModeType = this.dataViewMode.List;

  pageNumber: number = 0;
  selectedItems: ProductInterface[] = [];
  chips: DataGridFilterInterface[] = [];

  selectBarButtons: DataGridSelectBarButtonInterface<any>[] = [
    {
      title: 'Test button',
      onSelect: (selectedItems: any[]) => {
        
      }
    },
    {
      title: 'Test button1',
      onSelect: (selectedItems: any[]) => {
        
      }
    },
    {
      title: 'Test button2',
      onSelect: (selectedItems: any[]) => {
        
      }
    },
    {
      title: 'Test button3',
      onSelect: (selectedItems: any[]) => {
        
      }
    }
  ];

  columns: DataGridTableColumnInterface[] = [
    { name: 'selected', title: '', isActive: true, isToggleable: true },
    { name: 'title', title: 'title', isActive: true, isToggleable: true },
    { name: 'title1', title: 'field', isActive: true, isToggleable: true },
    { name: 'title2', title: 'field', isActive: true, isToggleable: true },
    { name: 'title3', title: 'field', isActive: true, isToggleable: true },
    { name: 'title4', title: 'field', isActive: true, isToggleable: true },
    { name: 'title5', title: 'field', isActive: false, isToggleable: false }
  ];

  searchValue: string;

  get activeColumns(): string[] {
    return this.columns
      .filter((column: DataGridTableColumnInterface) => column.isActive)
      .map((column: DataGridTableColumnInterface) => column.name);
  }

  constructor(
    injector: Injector,
    private httpClient: HttpClient
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.fetchProducts(0);
  }

  onRowSelected(item: ProductInterface): void {
    const itemIndex: number = this.selectedItems.indexOf(item);
    const updatedArray: ProductInterface[] = this.selectedItems.slice();
    if (itemIndex > -1) {
      updatedArray.splice(itemIndex, 1);
    } else {
      updatedArray.push(item);
    }
    this.selectedItems = updatedArray;
  }

  onSelectBarClosed(): void {
    this.selectedItems = [];
  }

  onUnselected(): void {
    this.selectedItems = [];
  }

  onAllSelected(): void {
    this.selectedItems = this.items.slice();
  }

  onChipRemoved(chip: DataGridFilterInterface): void {
    let index: number = this.chips.indexOf(chip);

    if (index >= 0) {
      this.chips.splice(index, 1);
    }
  }

  sortData(event: any): void {
    
  }

  fetchProducts(page: number, search?: string): void {
    this.selectedItems = [];
    let url: string = `https://stage.payever.de/products/api/v1/products?f%5Bbusiness%5D%5Bv%5D%5B%5D=b197bf22-6309-11e7-a2a8-5254008319f0&limit=${this.pageSize}&page=${page || this.pageNumber}`;

    this.pageNumber = page || this.pageNumber;
    if (Boolean(search) || search === '') {
      this.searchValue = search;
      url += `&f[search]=${search}`;
    }

    // TODO Example still not working
    // this.httpClient.get(url)
    //   .subscribe((products: any) => {
    //     this.items = products.collection;
    //     this.allItemsCount = products.pagination.item_count;
    //   });
    const json = {"data":{"getProducts":{"products":[{"images":["1ec453ec-46e4-43a0-a18a-a3c6b9122486-31mLc0sF99L"],"id":"52c5a31e-8bfe-4038-b055-9aa4a359bc48","title":"wei� A6 Karte 300gsm 50 Blatt","description":"","onSales":false,"price":65,"salePrice":null,"vatRate":null,"sku":"MP-H12C-FRYY","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[{"title":"OFFICE_PRODUCTS"}],"variants":[],"channelSets":[],"shipping":{"free":null,"general":null,"weight":0.24,"width":12,"length":15.2,"height":2.2}},{"images":["5b97af31-d72f-4f98-95cb-fa1ad514e18f-no-img-sm"],"id":"4ca6dc0a-a16f-49f9-88a1-5d6f70191491","title":"234","description":"ejejejjejde","onSales":false,"price":3993,"salePrice":null,"vatRate":null,"sku":"jjjj","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["6b13a426-ea57-4c91-842b-5b9dee5891fa-no-img-sm"],"id":"8b334359-c682-4df5-8a6b-b2821cbba6ea","title":"te","description":"324","onSales":false,"price":23,"salePrice":null,"vatRate":null,"sku":"34","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["e54fcc4e-6860-489a-8e7d-53338baf361a-no-img-sm"],"id":"d8c4cf1a-6a87-4fe9-83de-1c69103552bd","title":"strawberry","description":"iiasksa","onSales":false,"price":3.99,"salePrice":null,"vatRate":null,"sku":"llaklaslsamxyp2304","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["2931bb80-2947-47e0-9c9f-3aa70238683d-no-img-sm"],"id":"e55e67b7-cd77-45f1-8445-ca629e6a1951","title":"dhl","description":"ad","onSales":false,"price":0,"salePrice":null,"vatRate":null,"sku":"MKNh192","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["4b374f98-a334-46db-9ebf-6f1defd7390c-no-img-sm"],"id":"a6205cf2-ccae-44b9-94f4-ab462f44efb5","title":"Strawberry","description":"Orange","onSales":false,"price":0,"salePrice":null,"vatRate":null,"sku":"orange","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["78a7493c-26cf-47e8-abb0-7bd4431ed567-21ixkUySW%2BL"],"id":"b117914b-f66c-44f4-99d2-f741130e1464","title":"Orange","description":"sacasacasa","onSales":false,"price":33,"salePrice":null,"vatRate":null,"sku":"1237","barcode":"","currency":"EUR","type":"physical","active":true,"categories":[],"variants":[{"id":"cb70e335-55de-485a-bab2-25c872e4b3e2","images":[],"options":[{"name":"mN","value":"mn"}],"description":"12312312","onSales":false,"price":12,"salePrice":null,"sku":"1231231","barcode":""}],"channelSets":[{"id":"3c2293ec-03f1-4324-bd70-086e8b984b0a","type":"pos","name":"1"}],"shipping":{"free":false,"general":false,"weight":123,"width":123,"length":123,"height":123}},{"images":["dc49621f-07ed-4d8a-b138-dcccbef1d5f0-no-img-sm"],"id":"8ba71533-5ad6-4bd2-a9cb-4dfbb85ba39a","title":"Product1","description":"Description.","onSales":false,"price":0,"salePrice":null,"vatRate":null,"sku":"Product1","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[{"id":"3c2293ec-03f1-4324-bd70-086e8b984b0a","type":"pos","name":"1"}],"shipping":null},{"images":["003d0641-0109-42da-8487-27875c55ca8b-no-img-sm"],"id":"ca828163-1749-4bc4-aa92-790a049b8372","title":"test1","description":"lgjkhgkhvizfkh jbljbkjj","onSales":false,"price":1234,"salePrice":null,"vatRate":null,"sku":"ttgggni12345","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["82402a86-1b0e-49bb-9bfa-032d8114c17c-no-img-sm"],"id":"5595a371-11ab-48f8-afed-27c002e2846f","title":"Tail","description":"The tail","onSales":false,"price":88,"salePrice":null,"vatRate":null,"sku":"7786878779","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["8b88907f-d85e-4089-823c-d3712f418bfa-no-img-sm"],"id":"71f5dc4e-17ef-40a2-8cb4-0feda875a51c","title":"Watch","description":"a watch","onSales":false,"price":100,"salePrice":null,"vatRate":null,"sku":"watch123499_11","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["956e45c5-19ed-45c4-a5be-3f01774584d6-31QJx%2BZ-1YL"],"id":"64b0c874-7116-41d6-a20a-41f2ee627215","title":"Banana","description":"adadada s","onSales":false,"price":221313,"salePrice":null,"vatRate":null,"sku":"11111","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["0dd535fe-5e42-4bda-86cd-cc766c1b58f8-no-img-sm"],"id":"679e9aca-e8bf-4be7-aab1-cd058026c04d","title":"Tv","description":"Tv","onSales":false,"price":90,"salePrice":null,"vatRate":null,"sku":"tvitem1234","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["5df6963b-1727-427b-be61-c4bcb58d72f9-no-img-sm"],"id":"0bef4b57-37dd-4348-a018-bf2a427bf382","title":"Strawberry","description":"Strawberry","onSales":false,"price":3.99,"salePrice":null,"vatRate":null,"sku":"Strw200991","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["29d5fc6e-44a7-4138-9992-689be52dd245-no-img-sm"],"id":"16128941-51fa-409d-bda8-d89b4e925421","title":"Phone Gold","description":"gold Phone","onSales":false,"price":500,"salePrice":null,"vatRate":null,"sku":"GoldPhone1234_00","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["6f6dc004-2f63-4bf4-a83d-2fa32ade804f-no-img-sm"],"id":"6112c19b-8471-4a45-b416-f93f0dc955ae","title":"Strawber","description":"asdfasd asd","onSales":false,"price":3.99,"salePrice":null,"vatRate":null,"sku":"strawb1","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":[],"id":"0b795486-7f63-4a88-b97a-6bc4223e028f","title":"kjhj","description":"jhgh","onSales":false,"price":65,"salePrice":1,"vatRate":null,"sku":"8787uu8u8u","barcode":"uy","currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":{"free":false,"general":false,"weight":1,"width":12,"length":121,"height":12}},{"images":["7e9cf01c-8095-4b6b-a956-395859a76b7e-21rK58oQd4L"],"id":"31a84974-a9a7-4ee6-88ab-a3b47da5a145","title":"Testing product 2","description":"Testing product 2","onSales":false,"price":123,"salePrice":null,"vatRate":null,"sku":"testing_sku_2","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":["4c4a9ec3-ac5b-43a9-a551-08617e9c4745-21rK58oQd4L"],"id":"79039968-051f-4f25-83f8-0e16d04403ec","title":"Staging product","description":"hjkhjkhkj","onSales":false,"price":12,"salePrice":null,"vatRate":null,"sku":"staging_product","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null},{"images":[],"id":"e3c6c1f6-8255-449a-9833-cbe8c9783c14","title":"EST1","description":"EST1","onSales":false,"price":18,"salePrice":null,"vatRate":null,"sku":"12","barcode":null,"currency":"EUR","type":"physical","active":true,"categories":[],"variants":[],"channelSets":[],"shipping":null}],"info":{"pagination":{"page":1,"page_count":2,"per_page":20,"item_count":31}}}}} as any;
    this.items = json.data.getProducts.products;
    this.allItemsCount = json.data.getProducts.info.pagination.item_count;
  }

}

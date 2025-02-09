export interface Filter {
  key: string;
  value: string | number | number[] | string[];
  condition?: string;
}
export interface CollectionsLoadedInterface {
  info: any;
  collections: any[];
}

export interface InvoiceInterface {
  accessConfig: AccessConfigInterface
}

export interface AccessConfigInterface {
  isLive: boolean;
  internalDomain: string;
  internalDomainPattern: string;
  ownDomain: string;
  isLocked: boolean;
  isPrivate: boolean;
  privateMessage: string;
  privatePassword: string;
  socialImage: string;
  version?: string;
}


export interface ProductData {
      id: string,
      productId:string,
      name: string,
      description: string,
      price: string,
      salePrice: string,
      currency: string,
      image: string,
      categories: any[],
      active: string,
      variants: any[]
}

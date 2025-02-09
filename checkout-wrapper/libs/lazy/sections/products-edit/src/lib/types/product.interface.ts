export interface ProductFormInterface {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface FormInterface {
  products: ProductFormInterface[];
}

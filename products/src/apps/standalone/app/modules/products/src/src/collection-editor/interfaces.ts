import { Filter } from '../shared/interfaces/filter.interface';
import { Product } from '../shared/interfaces/product.interface';
import { ConditionClause, ConditionsType } from './enums';

export const mimeTypes = 'png|jpg|jpeg|bmp';

export interface Condition {
  key: string;
  value: string | number | number[] | string[];
  condition: ConditionClause;
}

export interface MainSection {
  images: string[];
  image: string;
  name: string;
  conditions?: {
    type: ConditionsType;
    filters: Filter[];
  };
}

export interface ContentSection {
  description: string;
}

export interface ProductsSection {
  products: Product[];
}

export interface ExternalError {
  section: string;
  field: MainSection | string;
  errorText: string;
}

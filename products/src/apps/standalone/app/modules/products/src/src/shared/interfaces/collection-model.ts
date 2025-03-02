import { Product } from './product.interface';
import { ConditionClause, ConditionsType } from '../enums/collection.enum';
import { Filter } from './filter.interface';

export interface CollectionModel {
  _id?: string;
  name: string;
  description?: string;
  image: string;
  images: string[];
  conditions?: {
    type: ConditionsType;
    filters: Filter[];
  };
  products: Product[];
  initialProducts?: Product[];
  parent?: string;
}

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

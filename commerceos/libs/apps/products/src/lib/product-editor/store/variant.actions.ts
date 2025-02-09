
import { VariantsSection } from '../../shared/interfaces/section.interface';

export enum VariantActionTypes {
  LoadVariant = '[Variant] Load Variant',
  VariantLoaded = '[Variant] Variant Loaded',
  UpdateVariant = '[Variant] Update Variant',
  CleanVariant = '[Variant] Clean Variant',
}



export class LoadVariant {
  static readonly type = VariantActionTypes.LoadVariant;
  constructor(public variantId: string, public isCreated: boolean) { }
}

export class VariantLoaded {
  static readonly type = VariantActionTypes.VariantLoaded;
  constructor(public variant: VariantsSection) { }
}

export class UpdateVariant {
  static readonly type = VariantActionTypes.UpdateVariant;
  constructor(public variant: Partial<VariantsSection>) { }
}

export class CleanVariant {
  static readonly type = VariantActionTypes.CleanVariant;
}



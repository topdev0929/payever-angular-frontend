import { RateTypesEnums } from '../enums/RateTypeEnums';
import { WeightMeasurementUnitsEnum } from '../enums/WeightMeasurementUnitsEnum';
import { ShippingSpeedEnum } from '../enums/ShippingSpeedEnum';

export interface ShippingZoneRateInterface {
  name?: string;
  rateType?: RateTypesEnums;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  weightUnit?: WeightMeasurementUnitsEnum;
  minWeight?: number;
  maxWeight?: number;
  shippingSpeed?: ShippingSpeedEnum;
}

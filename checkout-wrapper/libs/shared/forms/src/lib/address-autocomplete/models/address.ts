export interface AddressItem {
  address: string;
  placeId: string;
}

export interface AddressComponents {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface AddressDetails {
  address_components?: AddressComponents[];
}

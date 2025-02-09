import { AddressInterface } from '../../../address';

export interface GooglePlacesAutocompleteChangeEvent {
  value: string;
  address: AddressInterface;
}

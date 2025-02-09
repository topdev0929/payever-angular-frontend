import { GooglePlacesAutocompleteChangeEvent } from '.';

export interface AutocompleteGooglePlacesSettingsInterface {
  placeholder?: string;
  countriesOnly?: string[];
  onValueChange?(data: GooglePlacesAutocompleteChangeEvent): void;
}

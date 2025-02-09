# Payever Address module

Provide AddressService
Provide GoogleAutocompleteDirective
Provide AddressInterface

## Usage 

###Import module 

```typescript
import { AddressModule } from '@pe/ng-kit/modules/address';

@NgModule({
  imports: [
    AddressModule,
    ...
```

### AddressService has available methods:
- `countries: CountryListInterface` - provides localised Country list from node-countries-list
- `preferredCountries: string[]` - provides array with preferred countries codes
- `countriesArray: CountryArrayInterface[]` - provides array with countries (usable in render country selectors)
- `preferredCountriesArray: CountryArrayInterface[]` - provides array with preferred countries (usable in render country selectors)
- `getNameString(address: AddressInterface): string` - return string with formatted name
- `getAddressString(address: AddressInterface): string` - return string with formatted address

### Use GoogleAutocompleteDirective and event in your input element

```typescript
<input pe-google-autocomplete
       (address)="onAddressChanged($event)">
```
or
```typescript
<input pe-google-autocomplete
       [autocompleteType]="(cities)"
       (address)="onAddressChanged($event)">
```
`autocompleteType` can take a values from `type AutocompleteType` available in Module exports. By default `autocompleteType` has an `"address"` type. Please read the [Google doc for details](https://developers.google.com/maps/documentation/javascript/places-autocomplete#add_autocomplete)

`$event` has Interface `AddressInterface`

import { Component } from '@angular/core';

@Component({
  selector: 'doc-autocomplete',
  templateUrl: 'autocomplete-doc.component.html'
})
export class AutocompleteDocComponent {

  autocompleteDefaultExampleTemplate: string = require('!!raw-loader!./examples/autocomplete-default-example/autocomplete-default-example.component.html');
  autocompleteDefaultExampleComponent: string = require('!!raw-loader!./examples/autocomplete-default-example/autocomplete-default-example.component.ts');

  autocompleteCustomObjectExampleTemplate: string = require('!!raw-loader!./examples/autocomplete-custom-object-example/autocomplete-custom-object-example.component.html');
  autocompleteCustomObjectExampleComponent: string = require('!!raw-loader!./examples/autocomplete-custom-object-example/autocomplete-custom-object-example.component.ts');

  autocompleteGooglePlacesExampleTemplate: string = require('!!raw-loader!./examples/autocomplete-google-places-example/autocomplete-google-places-example.component.html');
  autocompleteGooglePlacesExampleComponent: string = require('!!raw-loader!./examples/autocomplete-google-places-example/autocomplete-google-places-example.component.ts');
}

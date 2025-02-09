import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { peVariables } from '../../../../../../../../../../../scss/pe-variables';

interface ImageInterface {
  formControl: FormControl;
  loading: boolean;
}

@Component({
    selector: 'doc-forms-fieldset-dark-example-media',
    templateUrl: 'forms-fieldset-dark-example-media.component.html'
})
export class FormsFieldsetDarkMediaComponent {
  email = new FormControl('', [Validators.required, Validators.email]);
  firstName = new FormControl('', [Validators.required]);
  lastName = new FormControl('', [Validators.required]);
  age = new FormControl('', [Validators.required]);
  prefixSuffixField = new FormControl('', [Validators.required]);
  toppings = new FormControl();

  toppingList = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  cities = ['Berlin', 'Paris', 'Moscow'];
  agreeWithTerms = false;
  agreeWithTerms2 = false;
  agreeWithTerms3 = false;

  favoriteSeason: string;
  favoriteSeason2: string;
  favoriteSeason3: string;

  seasons = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];

  images: ImageInterface[] = [
    { formControl: new FormControl(), loading: false },
    { formControl: new FormControl(), loading: false },
    { formControl: new FormControl(), loading: false },
    { formControl: new FormControl(), loading: false }
  ];
  spinerStrokeWidth: number = peVariables.toNumber('spinnerStrokeWidth');
  spinerDiameter: number = peVariables.toNumber('spinnerStrokeSm');
  spinerDiameterXxs: number = peVariables.toNumber('spinnerStrokeXxs');

  sliderWithLabelValue: number = 25;

  getErrorMessage(fieldName: string) {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }

  getFirstNameErrorMessage() {
    return this.firstName.hasError('required') ? 'You must enter a value' :
      '';
  }

  getLastNameErrorMessage() {
    return this.lastName.hasError('required') ? 'You must enter a value' :
      '';
  }

  getAgeErrorMessage() {
    return this.age.hasError('required') ? 'You must select your age' :
      '';
  }

  getPrefixSuffixFieldErrorMessage() {
    return this.prefixSuffixField.hasError('required') ? 'You must enter a value' :
      '';
  }

  pickImage(event: Event, image: ImageInterface): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const file: File = fileInput.files[0];
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);
    image.loading = true;
    reader.onload = () => {
      setTimeout(() => {
        image.formControl.setValue(reader.result);
        image.loading = false;
      }, 2000);
    };
  }

  clearImage(image: ImageInterface): void {
    image.loading = true;
    setTimeout(() => {
      image.formControl.setValue(null);
      image.loading = false;
    }, 500);
  }
}

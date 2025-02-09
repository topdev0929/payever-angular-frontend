import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

class State {
  constructor(public name: string, public population: string, public flag: string) { }
}

@Component({
  selector: 'doc-autocomplete-custom-object-example',
  templateUrl: 'autocomplete-custom-object-example.component.html'
})
export class AutocompleteCustomObjectExampleDocComponent {

  formControl: FormControl = new FormControl();
  states: State[] = [
    {
      name: 'Arkansas',
      population: '2.978M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg'
    },
    {
      name: 'California',
      population: '39.14M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg'
    },
    {
      name: 'Florida',
      population: '20.27M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg'
    },
    {
      name: 'Texas',
      population: '27.47M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg'
    }
  ];

  // another approach is to pass filter function to autocomplete
  filterStates(states: State[], name: string) {
    return states.filter((state: State) => {
      return state.name.toLowerCase().indexOf(name.toLowerCase()) === 0;
    });
  }

  // another approach is to pass displayWith function to autocomplete
  displayWith(state: State | null): string | null {
    return state ? state.name : null;
  }
}

import { Component } from '@angular/core';
import { peVariables, PeVariablesInterface } from '../../../../../../../../scss/pe-variables';
import { ColorPaletteItem } from '../../colors-doc.interfaces';

@Component({
  selector: 'doc-colors-example-primary',
  templateUrl: './colors-example-primary.component.html',
  styleUrls: ['./colors-example-primary.component.scss']
})
export class ColorsExamplePrimaryComponent {
  public peVariables: PeVariablesInterface = peVariables;
  colorPalette: ColorPaletteItem[];

  constructor() {
    this.colorPalette = [
      {
        title: 'Blue Payever',
        class: 'color-blue',
        variableDescription: '$color-blue',
        light: false
      },
      {
        title: 'Dark Blue',
        class: 'color-dark-blue',
        variableDescription: '$color-dark-blue',
        light: false
      },
      {
        title: 'Light Blue',
        class: 'color-light-blue',
        variableDescription: '$color-light-blue',
        light: false
      },
      {
        title: 'Green',
        class: 'color-green',
        variableDescription: '$color-green',
        light: false
      },
      {
        title: 'Dark Green',
        class: 'color-dark-green',
        variableDescription: '$color-dark-green',
        light: false
      },
      {
        title: 'Red',
        class: 'color-red',
        variableDescription: '$color-red',
        light: false
      },
      {
        title: 'Dark Red',
        class: 'color-dark-red',
        variableDescription: '$color-dark-red',
        light: false
      },
      {
        title: 'Orange',
        class: 'color-orange',
        variableDescription: '$color-orange',
        light: false
      },
      {
        title: 'Dark Orange',
        class: 'color-dark-orange',
        variableDescription: '$color-dark-orange',
        light: false
      }
    ];
  }
}

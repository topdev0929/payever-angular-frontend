import { Component } from '@angular/core';
import { peVariables, PeVariablesInterface } from '../../../../../../../../scss/pe-variables';
import { ColorPaletteItem } from '../../colors-doc.interfaces';

@Component({
  selector: 'doc-colors-example-black',
  templateUrl: './colors-example-black.component.html',
  styleUrls: ['./colors-example-black.component.scss']
})
export class ColorsExampleBlackComponent {
  public peVariables: PeVariablesInterface = peVariables;
  colorPalette: ColorPaletteItem[];

  constructor() {
    this.colorPalette = [
      {
        title: 'Black',
        class: 'color-black',
        variableDescription: '$color-black',
        light: false
      },
      {
        title: 'Black Payever',
        class: 'color-black-pe',
        variableDescription: '$color-black-pe',
        light: false
      },
      {
        title: 'Grey 1',
        class: 'color-grey-1',
        variableDescription: '$color-grey-1',
        light: false
      },
      {
        title: 'Grey 2',
        class: 'color-grey-2',
        variableDescription: '$color-grey-2',
        light: false
      },
      {
        title: 'Grey 3',
        class: 'color-grey-3',
        variableDescription: '$color-grey-3',
        light: false
      },
      {
        title: 'Grey 4',
        class: 'color-grey-4',
        variableDescription: '$color-grey-4',
        light: false
      },
      {
        title: 'Grey 5',
        class: 'color-grey-5',
        variableDescription: '$color-grey-5',
        light: false
      },
      {
        title: 'Grey 6',
        class: 'color-grey-6',
        variableDescription: '$color-grey-6',
        light: false
      },
      {
        title: 'Grey 7',
        class: 'color-grey-7',
        variableDescription: '$color-grey-7',
        light: false
      }
    ];
  }
}

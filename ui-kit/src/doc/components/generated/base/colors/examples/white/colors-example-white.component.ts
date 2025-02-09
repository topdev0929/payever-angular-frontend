import { Component } from '@angular/core';
import { peVariables, PeVariablesInterface } from '../../../../../../../../scss/pe-variables';
import { ColorPaletteItem } from '../../colors-doc.interfaces';

@Component({
  selector: 'doc-colors-example-white',
  templateUrl: './colors-example-white.component.html',
  styleUrls: ['./colors-example-white.component.scss']
})
export class ColorsExampleWhiteComponent {
  public peVariables: PeVariablesInterface = peVariables;
  colorPalette: ColorPaletteItem[];

  constructor() {
    this.colorPalette = [
      {
        title: 'white',
        class: 'color-white',
        variableDescription: '$color-white',
        light: true
      },
      {
        title: 'white Payever',
        class: 'color-white-pe',
        variableDescription: '$color-white-pe',
        light: true
      },
      {
        title: 'White Grey 1',
        class: 'color-white-grey-1',
        variableDescription: '$color-white-grey-1',
        light: true
      },
      {
        title: 'White Grey 2',
        class: 'color-white-grey-2',
        variableDescription: '$color-white-grey-2',
        light: true
      },
      {
        title: 'White Grey 3',
        class: 'color-white-grey-3',
        variableDescription: '$color-white-grey-3',
        light: true
      },
      {
        title: 'White Grey 4',
        class: 'color-white-grey-4',
        variableDescription: '$color-white-grey-4',
        light: true
      },
      {
        title: 'White Grey 5',
        class: 'color-white-grey-5',
        variableDescription: '$color-white-grey-5',
        light: true
      },
      {
        title: 'White Grey 6',
        class: 'color-white-grey-6',
        variableDescription: '$color-white-grey-6',
        light: true
      },
      {
        title: 'White Grey 7',
        class: 'color-white-grey-7',
        variableDescription: '$color-white-grey-7',
        light: true
      },
      {
        title: 'White Grey 8',
        class: 'color-white-grey-8',
        variableDescription: '$color-white-grey-8',
        light: true
      },
      {
        title: 'White Grey 9',
        class: 'color-white-grey-9',
        variableDescription: '$color-white-grey-9',
        light: true
      }
    ];
  }
}

import { FormControl } from '@angular/forms';
import { test } from '@jest/globals';

import { PeCustomValidators } from './custom-validators.constants';
/*
the string should not contain only whitespaces

Hex values are strings with 6 digits/leters(a-f) with that follow a #

*/

const whiteSpaceInvalid = [
  ' ',
  '  ',
  '                 ',
  '   ',
  '     ',
  '       ',
  '         ',
  '           ',
];

const whiteSpaceValid = [
  '',
  '0',
  '6890abc',
  '.    .',
  '. .##11### . .',
  '              .',
  '     hello     ',
  ' test',
  'test    ',
  'ma--il2',
  '123456890123456789',
  'a-b.c-d',
  'a-b.c-d',
  '123correct-prefix-start-with-numbers.ab',
];

describe('PeCustomValidators.NoWhiteSpace', () => {
  const cases: [string[], { [key: string]: boolean }][] = [
    [whiteSpaceValid, null],
    [whiteSpaceInvalid, { whitespace: true }],
  ];

  cases.forEach(([str, expected])=>{   
    const validity = expected ? 'invalid' : 'valid';
    test.each(str)(`string: %s should mark as ${validity}`,(str)=>{
      const control = new FormControl(str);
      expect(PeCustomValidators.NoWhiteSpace(control)).toEqual(expected);
    });
  });
});



const hexInvalid = [
  ' ',
  '  ',
  '  #               ',
  '   ',
  '     ',
  '      # ',
  '         ',
  '           ',
  '     #      ',
  '           ',
  '           ',
  '           ',
  '           ',
  '   #556        ',
  '#4',
  '#434',
  '#77',
  '0',
  '25245',
  '3434',
  '2ff454545455',
  'ffffff',
  'f2f43f5fw45h',
  '#12345G',
  '#ABCDEH',
  '#H2343G',
  '4f607d',
  '0845a6',
  'ffffff',
  '14305e',
  'ea05f2',
  'aca6ff',
  '000000',
  "2D61b5",
  "2D61B5",
  "0062ff",
  "0062FF",
  "0062fF",
  "4c5C75",
  "4C5c75",
  "4C5C75",
  "FFFFFF",
];

const hexValid = [
  '#4f607d',
  '#0845a6',
  '#ffffff',
  '#14305e',
  '#ea05f2',
  '#aca6ff',
  '#000000',
  "#2D61b5",
  "#2D61B5",
  "#0062ff",
  "#0062FF",
  "#0062fF",
  "#4c5C75",
  "#4C5c75",
  "#4C5C75",
  "#FFFFFF",
];

describe('PeCustomValidators.HexValidator', () => {
  const cases: [string[], { [key: string]: boolean }][] = [
    [hexValid, null],
    [hexInvalid, { badHex: true }],
  ];

  cases.forEach(([str, expected])=>{   
    const validity = expected ? 'invalid' : 'valid';
    test.each(str)(`string: %s should mark as ${validity}`,(str)=>{
      const control = new FormControl(str);
      expect(PeCustomValidators.HexValidator(control)).toEqual(expected);
    });
  });
});
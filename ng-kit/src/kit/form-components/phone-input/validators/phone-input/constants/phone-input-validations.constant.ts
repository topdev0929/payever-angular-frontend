import { PhoneInputValidationInterface } from '../types';

export const PHONE_INPUT_VALIDATIONS: PhoneInputValidationInterface[] = [
  // Attemp to match all below listed countries
  {
    defaultValidator: true,
    patternDefault: /^(?:\+\d{1,2})?\d{6,18}$/,
    patternCodeRequired: /^\+\d{1,2}\d{6,18}$/
  },

  // https://en.wikipedia.org/wiki/Telephone_numbers_in_the_United_Kingdom
  {
    countryCodes: ['en', 'gb'],
    patternDefault: /^(?:(?:\+?44)|0)[1-9]\d{8,9}$/,
    patternCodeRequired: /^\+44[1-9]\d{8,9}$/
  },

  // https://en.wikipedia.org/wiki/Telephone_numbers_in_Germany
  {
    countryCodes: ['de'],
    patternDefault: /^(?:(?:\+?49)|0|0049)[1-9]\d{8,10}$/,
    patternCodeRequired: /^\+49[1-9]\d{9,10}$/
  },

  // https://en.wikipedia.org/wiki/Telephone_numbers_in_Sweden
  {
    countryCodes: ['sv', 'se'],
    patternDefault: /^(?:(?:\+?46)|0)\d{1,3}\d{6,10}$/,
    patternCodeRequired: /^\+46\d{1,3}\d{6,10}$/
  },

  // https://en.wikipedia.org/wiki/Telephone_numbers_in_Norway
  {
    countryCodes: ['no', 'nb'],
    patternDefault: /^(?:(?:\+?47)|0)?\d{7,8}$/,
    patternCodeRequired: /^\+47\d{7,8}$/
  },

  // https://en.wikipedia.org/wiki/Telephone_numbers_in_Denmark
  {
    countryCodes: ['da', 'dk'],
    // incl. Faroe Islands, + Greenland
    patternDefault: /^(?:(?:(?:\+?45)?(\d{8,9}|37\d{10}))|(?:(?:\+29(9|8)|00)?\d{6}))$/,
    patternCodeRequired: /^(\+45(\d{8,9}|37\d{10})|(\+29(9|8)|00)\d{6})$/
  },

  // https://en.wikipedia.org/wiki/Telephone_numbers_in_Spain
  {
    countryCodes: ['es'],
    // incl. Gibraltar
    patternDefault: /^(?:\+?3(4|5))?\d{9}$/,
    patternCodeRequired: /^\+3(4|5)\d{9}$/
  },
];

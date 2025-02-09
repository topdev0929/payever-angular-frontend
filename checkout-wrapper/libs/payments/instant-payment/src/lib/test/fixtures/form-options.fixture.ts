import { cloneDeep } from '@pe/checkout/utils';

import { FormOptionsInterface } from '../../shared/types';

export const formOptionsInstallmentFixture: FormOptionsInterface = cloneDeep({
    'commodityGroups': [
      {
        'label': 'Bitte auswählen',
        'value': '147;-1',
      },
      {
        'label': 'Möbel',
        'value': '147;1',
      },
      {
        'label': 'Hifi/Elektrogeräte',
        'value': '147;2',
      },
      {
        'label': 'Computer/Zubehör',
        'value': '147;3',
      },
      {
        'label': 'Zweiräder',
        'value': '147;4',
      },
      {
        'label': 'Autozubehör/Reifen',
        'value': '147;5',
      },
      {
        'label': 'Heimwerker/Bauartikel',
        'value': '147;6',
      },
      {
        'label': 'Ärztliche Leistungen',
        'value': '147;7',
      },
      {
        'label': 'Reisen',
        'value': '147;8',
      },
      {
        'label': 'Sonstiges',
        'value': '147;9',
      },
      {
        'label': 'Optik',
        'value': '147;12',
      },
      {
        'label': 'Hörakustik',
        'value': '147;13',
      },
    ],
    'nationalities': [
      {
        'label': 'Deutschland',
        'value': '0',
      },
      {
        'label': 'Afghanistan',
        'value': '45',
      },
      {
        'label': 'Albanien',
        'value': '31',
      },
      {
        'label': 'Belgien',
        'value': '3',
      },
      {
        'label': 'Bosnien-Herzegowina',
        'value': '4',
      },
      {
        'label': 'Bulgarien',
        'value': '41',
      },
      {
        'label': 'Dänemark',
        'value': '5',
      },
      {
        'label': 'Estland',
        'value': '42',
      },
      {
        'label': 'Finnland',
        'value': '7',
      },
      {
        'label': 'Frankreich',
        'value': '8',
      },
      {
        'label': 'Georgien',
        'value': '46',
      },
      {
        'label': 'Ghana',
        'value': '47',
      },
      {
        'label': 'Griechenland',
        'value': '9',
      },
      {
        'label': 'Großbritannien',
        'value': '6',
      },
      {
        'label': 'Irak',
        'value': '32',
      },
      {
        'label': 'Iran',
        'value': '2',
      },
      {
        'label': 'Irland',
        'value': '11',
      },
      {
        'label': 'Italien',
        'value': '12',
      },
      {
        'label': 'Kasachstan',
        'value': '48',
      },
      {
        'label': 'Kongo',
        'value': '49',
      },
      {
        'label': 'Kosovo',
        'value': '50',
      },
      {
        'label': 'Kroatien',
        'value': '13',
      },
      {
        'label': 'Lettland',
        'value': '43',
      },
      {
        'label': 'Libanon',
        'value': '51',
      },
      {
        'label': 'Litauen',
        'value': '14',
      },
      {
        'label': 'Luxemburg',
        'value': '15',
      },
      {
        'label': 'Marokko',
        'value': '16',
      },
      {
        'label': 'Mazedonien',
        'value': '34',
      },
      {
        'label': 'Niederlande',
        'value': '10',
      },
      {
        'label': 'Norwegen',
        'value': '17',
      },
      {
        'label': 'Österreich',
        'value': '18',
      },
      {
        'label': 'Pakistan',
        'value': '35',
      },
      {
        'label': 'Polen',
        'value': '19',
      },
      {
        'label': 'Portugal',
        'value': '20',
      },
      {
        'label': 'Rumänien',
        'value': '36',
      },
      {
        'label': 'Russland',
        'value': '37',
      },
      {
        'label': 'Schweden',
        'value': '21',
      },
      {
        'label': 'Schweiz',
        'value': '22',
      },
      {
        'label': 'Serbien',
        'value': '38',
      },
      {
        'label': 'Slowakei',
        'value': '24',
      },
      {
        'label': 'Slowenien',
        'value': '23',
      },
      {
        'label': 'Spanien',
        'value': '25',
      },
      {
        'label': 'Sri Lanka',
        'value': '52',
      },
      {
        'label': 'Tschechien',
        'value': '26',
      },
      {
        'label': 'Türkei',
        'value': '27',
      },
      {
        'label': 'Ukraine',
        'value': '30',
      },
      {
        'label': 'Ungarn',
        'value': '39',
      },
      {
        'label': 'USA',
        'value': '1',
      },
      {
        'label': 'Vietnam',
        'value': '40',
      },
      {
        'label': 'sonstige',
        'value': '29',
      },
    ],
    'maritalStatuses': [
      {
        'label': 'verheiratet',
        'value': '15',
      },
      {
        'label': 'ledig',
        'value': '16',
      },
      {
        'label': 'getrennt',
        'value': '17',
      },
      {
        'label': 'geschieden',
        'value': '18',
      },
      {
        'label': 'verwitwet',
        'value': '19',
      },
    ],
    'identificationTypes': [
      {
        'label': 'Personalausweis',
        'value': '0',
      },
      {
        'label': 'Reisepass',
        'value': '1',
      },
    ],
    'employmentTypes': [
      {
        'label': 'Angestellter',
        'value': '4',
      },
      {
        'label': 'Angestellter Geschäftsführer',
        'value': '6',
      },
      {
        'label': 'Angestellter im öffentl. Dienst',
        'value': '7',
      },
      {
        'label': 'Arbeiter',
        'value': '8',
      },
      {
        'label': 'Arbeitsloser',
        'value': '9',
      },
      {
        'label': 'Arzt in Festanstellung',
        'value': '10',
      },
      {
        'label': 'Azubi',
        'value': '11',
      },
      {
        'label': 'Beamter',
        'value': '12',
      },
      {
        'label': 'Bundesfreiwilligendienst',
        'value': '27',
      },
      {
        'label': 'Hausfrau/Hausmann',
        'value': '16',
      },
      {
        'label': 'Pensionär',
        'value': '22',
      },
      {
        'label': 'Rentner',
        'value': '23',
      },
      {
        'label': 'Schüler',
        'value': '24',
      },
      {
        'label': 'Soldat, -Ausländische Streitkräfte',
        'value': '5',
      },
      {
        'label': 'Soldat, -Berufs',
        'value': '13',
      },
      {
        'label': 'Soldat, -Zeit',
        'value': '30',
      },
      {
        'label': 'Student',
        'value': '28',
      },
    ],
    'residentialTypes': [
      {
        'label': 'zur Miete',
        'value': '1',
      },
      {
        'label': 'Eigentum',
        'value': '10',
      },
      {
        'label': 'bezahltes Eigentum',
        'value': '12',
      },
      {
        'label': 'bei den Eltern',
        'value': '2',
      },
    ],
    'salutations': [
      {
        'label': 'Herr',
        'value': '0',
      },
      {
        'label': 'Frau',
        'value': '1',
      },
    ],
    'cpiTypes': [
      {
        'label': 'Ohne',
        'value': '0',
      },
      {
        'label': 'Mit',
        'value': '1',
      },
    ],
    'isDownPaymentAllowed': false,
  });

import { FormOptionsInterface } from '../../shared/types';

export const formOptionsInstallmentFixture: FormOptionsInterface = ({
  'maritalStatuses': [
    {
      'label': 'Samboer',
      'value': 'P',
    },
    {
      'label': 'Gift / Partnerskap',
      'value': 'G',
    },
    {
      'label': 'Ugift',
      'value': 'U',
    },
    {
      'label': 'Separert',
      'value': 'S',
    },
    {
      'label': 'Enke/-mann',
      'value': 'E',
    },
    {
      'label': 'Skilt',
      'value': 'D',
    },
  ],
  'residentialStatuses': [
    {
      'label': 'Selveier',
      'value': 'S',
    },
    {
      'label': 'Borettslag',
      'value': 'B',
    },
    {
      'label': 'Leier',
      'value': 'L',
    },
    {
      'label': 'Foreldre',
      'value': 'F',
    },
    {
      'label': 'Ukjent',
      'value': 'X',
    },
  ],
  'professionalStatuses': [
    {
      'label': 'Fast ansatt',
      'value': 'EMPLOYED',
    },
    {
      'label': 'Arbeidsavklaringspenger',
      'value': 'ARBEID_MONEY',
    },
    {
      'label': 'Vikariat',
      'value': 'TEMPORARY_POSITION',
    },
    {
      'label': 'Selvstendig næringsdrivende',
      'value': 'SELF_EMPLOYED',
    },
    {
      'label': 'Pensjonist /Ufør',
      'value': 'RETIRED',
    },
    {
      'label': 'Student',
      'value': 'OTHER',
    },
    {
      'label': 'Arbeidsledig',
      'value': 'UNEMPLOYED',
    },
  ],
  'paySources': [
    {
      'label': 'Lønn',
      'value': 'SALARY',
    },
    {
      'label': 'Gevinst fra salg av bolig/eiendom',
      'value': 'PROFIT_FROM_SALE_OF_REAL_ESTATE',
    },
    {
      'label': 'Arv/gaver',
      'value': 'INHERITANCE_GIFTS',
    },
    {
      'label': 'Gevinst fra spill/lotteri',
      'value': 'LOTTERY_GAMBLING',
    },
    {
      'label': 'Pensjon',
      'value': 'PENSION',
    },
    {
      'label': 'Utbytte eller lignende gevinst fra kommersiell aktivitet',
      'value': 'DIVIDEND_OR_SIMILAR_YIELD_FROM_COMMERCIAL_ACTIVITY',
    },
    {
      'label': 'Erstatning (forsikring, oppreisning, o.l.)',
      'value': 'COMPENSATION',
    },
    {
      'label': 'Inntekt fra kommersiell aktivitet inkludert leieinntekter',
      'value': 'INCOME_FROM_COMMERCIAL_ACTIVTY',
    },
    {
      'label': 'Gevinst fra salg av løsøre (bil, båt, etc.)',
      'value': 'PROFIT_FROM_MOVABLES',
    },
    {
      'label': 'Oppsparte midler',
      'value': 'SAVINGS',
    },
    {
      'label': 'Utbytte fra investeringer',
      'value': 'YIELD_FROM_INVESTMENTS',
    },
    {
      'label': 'Annen',
      'value': 'OTHER',
    },
    {
      'label': 'Offentlig stønad/trygd',
      'value': 'SOCIAL_BENEFITS',
    },
    {
      'label': 'Studielån/stipend',
      'value': 'EDUCATIONAL_SUPPORT',
    },
  ],
  'isAmlEnabled': true,
});

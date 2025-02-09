import { cloneDeep } from '@pe/checkout/utils';

import { FormInterface } from '../../shared/types';

export const formDataFixture: () => FormInterface = () => cloneDeep<FormInterface>({
  formCustomerDetails: {
    customer: {
      personalTitle: 'Pupkin',
      identificationNumber: '',
      identificationPlaceOfIssue: '',
      identificationDateOfIssue: '10/10/2015',
      identificationDateOfExpiry: '10/02/2099',
      personalNationality: 'Ukraine',
      personalPlaceOfBirth: 'The best place on the Earth',
      personalMaritalStatus: 'maried',
      addressLandlinePhone: '',
      addressCellPhone: '+491711234567',
    },
  },
});

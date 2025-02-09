import { cloneDeep } from '@pe/checkout/utils';

import { GetRatesParamsInterface } from '../../shared';

export const ratesParamsFixture = () => cloneDeep<GetRatesParamsInterface>({
    dayOfFirstInstalment: 15,
    amount: 20000,
    condition: 'good',
    cpi: true,
    dateOfBirth: '1995-08-22',
    profession: 'teacher',
    downPayment: 3000,
    weekOfDelivery: '2023-05-01',
    desiredInstalment: 18,
});
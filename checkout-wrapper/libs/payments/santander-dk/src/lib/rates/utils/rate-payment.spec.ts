import { ratesFixture } from '../../test';

import { getPaymentPeriod } from './rate-payment';

describe('getPaymentPeriod', () => {

  it('should return loanDurationInMonths for a standard rate', () => {

    const standardRate = ratesFixture()[0];
    const expectedValue = standardRate.parameters.loanDurationInMonths;

    expect(getPaymentPeriod(standardRate)).toEqual(expectedValue);

  });

  it('should add paymentFreeDuration to loanDurationInMonths for a BNPL rate', () => {

    const bnplRate = ratesFixture()[2];
    const expectedValue = bnplRate.parameters.loanDurationInMonths + bnplRate.parameters.paymentFreeDuration;

    expect(getPaymentPeriod(bnplRate)).toEqual(expectedValue);

  });

});

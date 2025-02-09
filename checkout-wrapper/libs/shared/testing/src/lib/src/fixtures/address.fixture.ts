import { AddressInterface, AddressTypeEnum, SalutationEnum } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const validBillingAddressFixture = (): AddressInterface => cloneDeep({
    id: 'uuid',
    type: AddressTypeEnum.BILLING,
    email: 'test@test.com',
    fullAddress: 'Rådhuspladsen, 59, København 1550, Denmark',
    salutation: SalutationEnum.SALUTATION_MR,
    firstName: 'firstName value 1',
    lastName: 'lastName value 1',
    country: 'country value 1',
    city: 'city value 1',
    street: 'street value 1',
    zipCode: 'zipCode value 1',
    organizationName: 'organizationName value 1',
    phone: '+4985012345',
});

export const VALID_SHIPPING_ADDRESS_STUB = (): AddressInterface => cloneDeep({
    id: 'uuid',
    type: AddressTypeEnum.SHIPPING,
    email: 'test@test.com',
    fullAddress: 'Rådhuspladsen, 59, København 1550, Denmark',
    salutation: SalutationEnum.SALUTATION_MR,
    firstName: 'firstName value 2',
    lastName: 'lastName value 2',
    country: 'country value 2',
    city: 'city value 2',
    street: 'street value 2',
    zipCode: 'zipCode value 2',
    organizationName: 'organizationName value 2',
    phone: '496912341235',
});

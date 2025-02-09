import { PaymentMethodEnum } from '@pe/checkout/types';

export const paymentFixture = () => {
    const payments = Object.values(PaymentMethodEnum).reduce((acc, value) => {
        acc[value] = {
            formOptions: {
                commodityGroups: [
                    {
                        label: `${value} label 1`,
                        value: 1000,
                    },
                    {
                        label: `${value} label 2`,
                        value: 1001,
                    },
                ],
                nationalities: [
                    {
                      label: 'Germany',
                      value: '0',
                    },
                    {
                      label: 'Afghanistan',
                      value: '45',
                    },
                    {
                      label: 'Albania',
                      value: '31',
                    },
                    {
                      label: 'Austria',
                      value: '18',
                    },
                    {
                        label: 'Bulgaria',
                        value: '41',
                    },
                ],
            },
            form: {
            },
            response: {
                payment: {},
            },
            details: {},
        };

        return acc;
    }, {} as any);

    return payments as { [Key in PaymentMethodEnum]?: any };
};

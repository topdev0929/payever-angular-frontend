interface WidgetDataSource {
  [x: string]: any[][];
}

/** Mock widget data */
export const MOCK_DATA: WidgetDataSource = {
  ['DetailedNumbers']: [
    [
      {
        value: undefined,
        text: 'Transactions',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Quantity',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Payment Type',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'Date 1',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'Date 2',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Payment Type 1',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Payment Type 2',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Payment Type 3',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Payment Type 4',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Total',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '00.000',
        currency: undefined,
        percent: undefined,
      },
    ],
  ],
  ['TwoColumns']: [
    [
      {
        value: undefined,
        text: 'Transactions',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'EUR',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'This month',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'Today',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '0k',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: '0.0',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '+0.0 than last month',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
    ],
  ],
  ['Percentage']: [
    [
      {
        value: undefined,
        text: 'Transactions',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'This month',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: '0%',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '+0%',
        currency: undefined,
        percent: undefined,
      },
    ],
  ],
  ['SimpleNumbers']: [
    [
      {
        value: undefined,
        text: 'Transactions',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'Earned today',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: '0.0',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '+0% than yesterday',
        currency: undefined,
        percent: undefined,
      },
    ],
  ],
  ['LineGraph']: [
    [
      {
        value: undefined,
        text: 'Transactions',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'Earn today',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: '+2.78',
        currency: undefined,
        percent: undefined,
      },
      {
        value: [
          {
            name: 'Mock',
            series: [
              {
                name: '1',
                value: 0,
              },
              {
                name: '2',
                value: 0,
              },
              {
                name: '3',
                value: 0,
              },
              {
                name: '4',
                value: 0,
              },
              {
                name: '5',
                value: 0,
              },
              {
                name: '6',
                value: 0,
              },
            ],
          },
        ],
        text: undefined,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: '0K',
        currency: undefined,
        percent: undefined,
      },
    ],
  ],
  ['widgetStyle']: [
    [
      {
        value: undefined,
        text: 'Transactions',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'EUR',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Quantity',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: null,
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Type',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'From',
        currency: undefined,
        percent: undefined,
      },
      {
        value: undefined,
        text: 'Till',
        currency: undefined,
        percent: undefined,
      },
    ],
    [
      {
        value: undefined,
        text: 'Type 1',
        currency: undefined,
        percent: undefined,
      },
      {
        value: 0,
        text: undefined,
        currency: undefined,
        percent: undefined,
      },
      {
        value: 0,
        text: undefined,
        currency: undefined,
        percent: undefined,
      },
    ],
  ],
};

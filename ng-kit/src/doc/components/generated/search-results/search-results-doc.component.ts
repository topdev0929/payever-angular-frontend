import { Component } from '@angular/core';
import { SearchGroup } from '../../../../kit/search-results';

@Component({
  selector: 'search-results-doc',
  templateUrl: 'search-results-doc.component.html'
})
export class SearchResultsDocComponent {
  htmlExample: string =  require('raw-loader!./examples/search-results-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/search-results-example-basic.ts.txt');
  groups: SearchGroup[] = [
    {
      heading: 'Pepper',
      items: [
        {
          iconSrc: '#icon-alert-24',
          title: 'Red',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'White',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'Black',
          description: 'Description'
        }
      ],
    },
    {
      heading: 'Salt',
      items: [
        {
          iconSrc: '#icon-alert-24',
          title: 'White',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'Red',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'Blue',
          description: 'Description'
        }
      ]
    },
    {
      heading: 'Onion',
      items: [
        {
          iconSrc: '#icon-alert-24',
          title: 'Yellow',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'Purple',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'White',
          description: 'Description'
        }
      ]
    }
  ];

  group: SearchGroup[] = [
    {
      heading: 'Pepper',
      items: [
        {
          iconSrc: '#icon-alert-24',
          title: 'Red',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'White',
          description: 'Description'
        },
        {
          iconSrc: '#icon-alert-24',
          title: 'Black',
          description: 'Description'
        }
      ],
    },
  ];
}

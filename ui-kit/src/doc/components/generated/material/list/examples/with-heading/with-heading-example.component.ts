import { Component } from '@angular/core';

@Component({
  selector: 'list-with-heading-example',
  templateUrl: 'with-heading-example.component.html'
})
export class WithHeadingExampleComponent {

  groups: any[] = [
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
}

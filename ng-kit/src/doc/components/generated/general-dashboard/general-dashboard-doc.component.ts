import { Component } from '@angular/core';
import { GeneralDashboardItemInterface } from '../../../../kit/general-dashbord';

@Component({
  selector: 'doc-general-dashboard',
  templateUrl: 'general-dashboard-doc.component.html'
})
export class GeneralDashboardDocComponent {
  htmlExample: string =  require('raw-loader!./examples/general-dashboard-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/general-dashboard-example-basic.ts.txt');
  dashboardItems: GeneralDashboardItemInterface[];

  constructor() {
    this.dashboardItems = [
      {
        title: 'Get started',
        description: 'Description',
        btnsMoreLess: {
          btnMoreName: 'More',
          btnLessName: 'Less'
        },
        subItems: [
          {
            imgSrc: require('../../../assets/img/Bender-300x300.jpg'),
            name: 'Credit Card',
            description: `Are very welcome! And remember, contribution is not only PRs and code,
                          but any help with docs or helping other developers to solve issues are
                          very appreciated! Thanks in advance!`,
            btnGroup: {
              btnName: 'Edit',
              btnClickHandler: () => {
                alert('Clicked');
              },
              btnDropdown: [
                {
                  btnName: 'Action',
                  btnClickHandler: () => {
                    alert('Action button clicked');
                  }
                },
                {
                  btnName: 'Other action link',
                  btnClickHandler: () => {
                    alert('Other action link clicked');
                  }
                }
              ]
            },
            switcher: {
              isChecked: true,
              switcherChangeHandler: (event: Event) => {
                alert('Hello!');
              }
            },
            lbReadMore: 'Read more'
          },
          {
            imgSrc: require('../../../assets/img/Bender-300x300.jpg'),
            name: 'Santander Installments',
            description: 'Are very welcome!',
            btnGroup: {
              btnName: 'Edit'
            },
            switcher: {
              isChecked: false
            },
            lbReadMore: 'Read more'
          },
          {
            imgSrc: require('../../../assets/img/Bender-300x300.jpg'),
            name: 'Credit Card',
            description: `Are very welcome! And remember, contribution is not only PRs and code,
                        but any help with docs or helping other developers to solve issues are
                        very appreciated! Thanks in advance!`,
            btnGroup: {
              btnName: 'Edit'
            },
            switcher: {
              isChecked: false
            },
            lbReadMore: 'Read more'
          },
          {
            imgSrc: require('../../../assets/img/Bender-300x300.jpg'),
            name: 'Santander Installments',
            description: `Are very welcome! And remember, contribution is not only PRs and code,
                        but any help with docs or helping other developers to solve issues are
                        very appreciated! Thanks in advance!`,
            btnGroup: {
              btnName: 'Edit'
            },
            switcher: {
              isChecked: true
            },
            lbReadMore: 'Read more'
          }
        ]
      },
      {
        title: 'Run',
        description: 'Description',
        subItems: [
          {
            imgSrc: require('../../../assets/img/Bender-300x300.jpg'),
            name: 'Credit Card',
            description: `Are very welcome! And remember, contribution is not only PRs and code,
                          but any help with docs or helping other developers to solve issues are
                          very appreciated! Thanks in advance!`,
            btnGroup: {
              btnName: 'Open',
              btnClickHandler: () => {
                alert('Opened!');
              }
            },
            lbReadMore: 'Read more'
          },
          {
            imgSrc: require('../../../assets/img/Bender-300x300.jpg'),
            name: 'Credit Card',
            description: `Are very welcome! And remember, contribution is not only PRs and code,
                          but any help with docs or helping other developers to solve issues are
                          very appreciated! Thanks in advance!`,

            btnGroup: {
              btnName: 'Open'
            },
            lbReadMore: 'Read more',
            isDisabled: true
          }
        ]
      }
    ];
  }

}

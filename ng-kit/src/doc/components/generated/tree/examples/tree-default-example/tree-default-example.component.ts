import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TreeInterface } from '../../../../../../kit/tree/src/interfaces';
import { ThemeType } from '../../../../../../kit/tree/src/enums';

@Component({
  selector: 'doc-tree-default-example',
  templateUrl: 'tree-default-example.component.html',
  styleUrls: ['tree-default-example.component.scss']
})
export class TreeDefaultExampleDocComponent {
  theme: ThemeType = ThemeType.Default;
  treeData: TreeInterface[];
  @ViewChild('AddonPrepend', { static: true }) AddonPrepend: TemplateRef<any>;

  ngOnInit() {
    this.treeData = [
      {
        label: 'Store',
        level: 0,
        addonPrepend: this.AddonPrepend,
        children: [
          {
            label: 'Label',
            level: 1
          },
          {
            label: 'Label',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2 ,
                children: [
                  {
                    label: 'Label',
                    level: 3
                  },
                  {
                    label: 'Label',
                    level: 3
                  }
                ]
              },
              {
                label: 'Label',
                level: 2
              }
            ]
          },
          {
            label: 'Label',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2
              }
            ]
          }
        ]
      },
      {
        label: 'Market',
        level: 0,
        addonPrepend: this.AddonPrepend,
        children: [
          {
            label: 'Label',
            level: 1
          },
          {
            label: 'Label',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2
              },
              {
                label: 'Label',
                level: 2
              }
            ]
          },
          {
            label: 'Label',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2
              }
            ]
          }
        ]
      },
      {
        label: 'Points of Sale',
        level: 0,
        addonPrepend: this.AddonPrepend,
        children: [
          {
            label: 'Label',
            level: 1
          },
          {
            label: 'Label',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2
              },
              {
                label: 'Label',
                level: 2
              }
            ]
          },
          {
            label: 'Label',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2
              }
            ]
          }
        ]
      },
      {
        label: 'Offers',
        level: 0,
        addonPrepend: this.AddonPrepend,
        children: [
          {
            label: 'Label',
            level: 1
          },
          {
            label: 'Label',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2
              },
              {

                label: 'Label',
                level: 2
              }
            ]
          },
          {
            label: 'c2',
            level: 1,
            children: [
              {
                label: 'Label',
                level: 2
              }
            ]
          }
        ]
      }
    ];
  }

  onClickAddonPrepend(): void {
    
  }
}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HeaderButtonInterface } from "../../../../../../kit/sidenav/src/interfaces";
import { SubheaderInterface } from "../../../../../../kit/sidenav/src/interfaces";
import { TreeInterface } from "../../../../../../kit/tree/src/interfaces";
import { ThemeType } from '../../../../../../kit/tree/src/enums';

@Component({
  selector: 'doc-sidenav-default-example',
  templateUrl: 'sidenav-default-example.component.html',
  styleUrls: ['sidenav-default-example.component.scss']
})
export class SidenavDefaultExampleDocComponent implements OnInit {

  leftButtonConfig: HeaderButtonInterface = {
    disabled: false,
    title: '',
    icon: '#icon-arrow-left-small-16',
    onClick: () => {
      this.close()
    }
  };

  rightButtonConfig: HeaderButtonInterface = {
    disabled: false,
    title: 'Done',
    onClick: () => {
      this.close()
    }
  };

  subheaderConfig: SubheaderInterface[] = [
    {
      title: 'Pages',
      disabled: false,
      onClick: () => {
        this.activeView = 'Pages'
      }
    },
    {
      title: 'Navigation',
      disabled: false,
      onClick: () => {
        this.activeView = 'Navigation'
      }
    }
  ];
  isOpen: boolean;
  theme: ThemeType = ThemeType.Dark;
  subheaderData: SubheaderInterface[];
  treeData: TreeInterface[];
  activeView: string = 'Pages';
  @ViewChild('AddonPrepend', { static: true }) AddonPrepend: TemplateRef<any>;
  @ViewChild('NodeTreeContent', { static: true }) NodeTreeContent: TemplateRef<any>;

  ngOnInit(): void {
    this.subheaderData = this.subheaderConfig;
    this.treeData = [
      {
        label: 'Store',
        level: 0,
        addonPrepend: this.AddonPrepend,
        hideScheme: true,
        children: [
          {
            level: 1,
            content: this.NodeTreeContent,
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

  submit(): void {
    this.toggle();
    
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onClickAddonPrepend(): void {
    
  }
}

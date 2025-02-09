import { Component } from '@angular/core';
import { TreeControl, NestedTreeControl, FlatTreeControl } from '@angular/cdk/tree';

import { of } from 'rxjs/observable/of';

interface TestData {
    name: string;
    level: number;
    isNotVisible: boolean;
    state: string;
    children?: TestData[];
}
const GetLevel = (node: TestData) => node.level;
const IsExpandable = (node: TestData) => node.children && node.children.length > 0;
const GetChildren = (node: TestData) => of(node.children);
const TC2 = new FlatTreeControl(GetLevel, IsExpandable);
const TC = new NestedTreeControl(GetChildren);

@Component({
    selector: 'sidenav-tree-example',
    templateUrl: './sidenav-tree-example.component.html',
    styleUrls: ['./sidenav-tree-example.component.scss']

})
export class SidenavTreeExampleComponent {

    fillerNav = Array(5).fill(0).map((_, i) => `Nav Item ${i + 1}`);

    fillerContent = Array(5).fill(0).map(() =>
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

    tc = TC;
    tc2 = TC2;
    data = [
        {
            name: 'Store',
            level: 0,
            isNotVisible: true,
            children: [
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        {
                            name: 'Label',
                            level: 2 ,
                            children: [
                                { name: 'Label', level: 3 },
                                { name: 'Label', level: 3 }
                            ]
                        },
                        { name: 'Label', level: 2 }
                    ]
                },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 }
                    ]
                }
            ]
        },
        {
            name: 'Market',
            level: 0,
            state: 'State',
            children: [
                { name: 'Label', level: 1 },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 },
                        { name: 'Label', level: 2 }
                    ]
                },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 }
                    ]
                }
            ]
        },
        {
            name: 'Points of Sale',
            level: 0,
            children: [
                { name: 'Label', level: 1 },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 },
                        { name: 'Label', level: 2 }
                    ]
                },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 }
                    ]
                }
            ]
        },
        {
            name: 'Offers',
            level: 0,
            children: [
                { name: 'Label', level: 1 },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 },
                        { name: 'Label', level: 2 }
                    ]
                },
                {
                    name: 'c2',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 }
                    ]
                }
            ]
        },
        {
            name: 'Ads',
            level: 0,
            children: [
                { name: 'Label', level: 1 },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 },
                        { name: 'Label', level: 2 }
                    ]
                },
                {
                    name: 'Label',
                    level: 1,
                    children: [
                        { name: 'Label', level: 2 }
                    ]
                }
            ]
        }
    ];

    hasChild(_: number, node: TestData) {
        return node.children != null && node.children.length > 0;
    }

}

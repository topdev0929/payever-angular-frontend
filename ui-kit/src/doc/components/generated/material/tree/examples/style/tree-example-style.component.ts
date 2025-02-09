import { Component } from '@angular/core';
import { TreeControl, NestedTreeControl, FlatTreeControl } from '@angular/cdk/tree';

import { of } from 'rxjs/observable/of';

interface TestData {
  name: string;
  level: number;
  children?: TestData[];
}
const GetLevel = (node: TestData) => node.level;
const IsExpandable = (node: TestData) => node.children && node.children.length > 0;
const GetChildren = (node: TestData) => of(node.children);
const TC2 = new FlatTreeControl(GetLevel, IsExpandable);
const TC = new NestedTreeControl(GetChildren);

@Component({
  selector: 'doc-tree-example-style',
  templateUrl: './tree-example-style.component.html',
  styleUrls: ['./tree-example-style.component.scss']
})
export class TreeExampleStyleComponent {
    tc = TC;
    tc2 = TC2;
    data = [
        {
            name: 'Store',
            level: 0,
            children: [
                { name: 'Label', level: 1 },
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
        console.log(node);
        return node.children != null && node.children.length > 0;
    }
}

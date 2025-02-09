import { Component } from '@angular/core';

@Component({
    selector: 'doc-expansion-panel-example-size-variations',
    templateUrl: './expansion-panel-example-size-variations.component.html',
    styleUrls: ['./expansion-panel-example-size-variations.component.scss']
})
export class ExpansionPanelExampleSizeVariationsComponent {
    panelOpenState: boolean = false;

    vegetableList: string[] = ['Pepper', 'Salt', 'Paprika', 'Cabbage', 'Potato', 'Onion'];

    sections: any[] = [
        {
            name: 'Header',
            elements: [
                {
                    name: 'Menu',
                    icon: '#icon-b-text-32'
                },
                {
                    name: 'Text',
                    icon: '#icon-b-text-32'
                },
                {
                    name: 'Logo',
                    icon: '#icon-b-text-32'
                }
            ]
        },
        {
            name: 'Body',
            elements: [
                {
                    name: 'Image',
                    icon: '#icon-sb-image-16'
                },
                {
                    name: 'Text',
                    icon: '#icon-b-text-32'
                },
                {
                    name: 'Grid',
                    icon: '#icon-b-catalog-32'
                }
            ]
        },
        {
            name: 'Footer',
            elements: [
                {
                    name: 'Paginator',
                    icon: '#icon-b-text-32'
                },
                {
                    name: 'Button',
                    icon: '#icon-b-text-32'
                },
                {
                    name: 'Link',
                    icon: '#icon-b-text-32'
                }
            ]
        }
    ];
}

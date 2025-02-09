import { Component } from '@angular/core';

@Component({
    selector: 'doc-mat-card',
    templateUrl: 'card-mat-doc.component.html'
})
export class CardMatDocComponent {
    cardDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/card-default-example.component.html');
    cardDefaultExampleComponent: string = require('!!raw-loader!./examples/default/card-default-example.component.ts');

    cardColorVariationsExampleTemplate: string = require('!!raw-loader!./examples/color-variations/card-color-variations-example.component.html');
    cardColorVariationsExampleComponent: string = require('!!raw-loader!./examples/color-variations/card-color-variations-example.component.ts');

    cardShapeVariationsExampleTemplate: string = require('!!raw-loader!./examples/shape-variations/card-shape-variations-example.component.html');
    cardShapeVariationsExampleComponent: string = require('!!raw-loader!./examples/shape-variations/card-shape-variations-example.component.ts');

    cardSizeVariationsExampleTemplate: string = require('!!raw-loader!./examples/size-variations/card-size-variations-example.component.html');
    cardSizeVariationsExampleComponent: string = require('!!raw-loader!./examples/size-variations/card-size-variations-example.component.ts');

    cardTransparentExampleTemplate: string = require('!!raw-loader!./examples/transparent/card-transparent-example.component.html');
    cardTransparentExampleComponent: string = require('!!raw-loader!./examples/transparent/card-transparent-example.component.ts');

    contentEditorLayoutExampleTemplate: string = require('!!raw-loader!./examples/content-editor-layout/content-editor-layout-example.component.html');
    contentEditorLayoutExampleComponent: string = require('!!raw-loader!./examples/content-editor-layout/content-editor-layout-example.component.ts');
}

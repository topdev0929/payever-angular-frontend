import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import {
    PebItemBarModule,
    PebNumberInputModule,
    PebSelectInputModule,
    PebSizeInputModule,
    PebSlideToggleModule,
} from '@pe/builder/form-controls';
import { PebPipesModule } from '@pe/builder/pipes';
import { I18nModule } from '@pe/i18n';
import { PebButtonModule } from '@pe/ui';

import { PebFunctionFormModule } from '../integrations';

import { PebInteractionAnimationFormComponent } from './animation/interaction-animation-form.component';
import { PebInteractionsIntegrationFormComponent } from './integration/interactions-integration-form.component';
import { PebInteractionsFormEditComponent } from './interactions-form-edit.component';
import { PebInteractionsFormListComponent } from './interactions-form-list.component';
import { PebInteractionSliderFormComponent } from './slider/interaction-slider-form.component';
import { PebInteractionVideoFormComponent } from './video/interaction-video-form.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PebFunctionFormModule,
        PebButtonModule,
        PebSlideToggleModule,
        PebSelectInputModule,
        PebNumberInputModule,
        PebPipesModule,
        PebAutoHideScrollbarModule,
        PebSizeInputModule,
        MatIconModule,
        I18nModule,
        PebItemBarModule,
    ],    
    declarations: [
        PebInteractionsFormEditComponent,
        PebInteractionsFormListComponent,
        PebInteractionAnimationFormComponent,
        PebInteractionSliderFormComponent,
        PebInteractionVideoFormComponent,
        PebInteractionsIntegrationFormComponent,
    ],
    exports: [
        PebInteractionsFormEditComponent,
        PebInteractionsFormListComponent,
    ],
})
export class PebInteractionsFormModule {
}

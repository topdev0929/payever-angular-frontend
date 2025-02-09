import { NgModule } from '@angular/core';
import { ReadMoreDirective } from './read-more.directive';

const externalComponents = [ReadMoreDirective];

@NgModule({
    declarations: externalComponents,
    exports: externalComponents,
})
export class ReadMoreModule {
}

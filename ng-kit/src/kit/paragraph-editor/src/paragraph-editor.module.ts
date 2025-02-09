import {NgModule} from '@angular/core';
import {ParagraphEditorComponent} from "./components/paragraph-editor.component";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [CommonModule],
    declarations: [ParagraphEditorComponent],
    exports: [ParagraphEditorComponent]
})
export class ParagraphEditorModule {
}

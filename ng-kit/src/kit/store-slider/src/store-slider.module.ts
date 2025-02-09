import { NgModule } from '@angular/core';
import { StoreSliderComponent } from "./components/store-slider.component";
import { StoreSliderService } from "./store-slider.service";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [CommonModule],
    declarations: [StoreSliderComponent],
    providers: [ StoreSliderService ],
    exports: [StoreSliderComponent]
})
export class StoreSliderModule {
}

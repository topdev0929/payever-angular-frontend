import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app.module';
if (process.env && process.env['ENV'] === 'production') {
    enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule);

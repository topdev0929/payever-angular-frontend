# i18n Module

Angular translation module with translation tools

## Usage

### Import I18nModule

Import translation module

```ts
@NgModule({
  imports: [
    I18nModule.forRoot(),
    ...
```

### Resolving translations

Use TranslationGuard provided by I18nModule with `i18nDomains` route data

```ts
import { TranslationGuard } from '@pe/ng-kit/modules/i18n';

const appRoutes: Routes = [
  {
    path: '',
    component: MyComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['welcome-todo', 'ng-kit-ng-kit'],
    }
  },
];

```

### "forChild" usage

For child modules that do not resolve translations on their own pls use .forChild method that provides only required directives without introducing any providers.

```ts
@NgModule({
  imports: [
    I18nModule.forChild(),
    ...
```

### Create translations file

Create 'locale' folder in hub's assets folder

```
assets/locale/en/pos.json
```

and fill it with translation key/value pairs:
```
{
    "test": "test in english",
    "test_fruit": "test {{ var1 }} or {{ var2 }}"
}
```

### Usage

There are 3 ways to use module: directive and pipe in templates and TranslateService in components

#### Directive
```html
<span translate>test</span>
<span [translate]="{ var1: 'apple', var2: 'orange'}">test_fruit</span></p>
```

#### Pipe
```html
<span>{{ 'test' | translate }}</span>
<span>{{ 'test_fruit' | translate:{ var1: 'apple', var2 'orange' } }}</span></p>
```

#### Translate service
```ts
export class MyComponent {
  constructor(
    public ts: TranslateService,
  ) {
    this.ts.translate('test');
    this.ts.translate('test_fruit', { var1: 'apple', var2 'orange' });
  }
}
```

# i18n cli tool

Sync frontend translations with server

## Usage

Add script to `package.json`: `"i18n": "pe-i18n-cli push"`

### Additional arguments
`--domain-prefix=checkout` - This name will be applied to json file name

This directory will be used for output

## Translation file locations

Tool searches for translation files in 3 starting points:

1. `{root}/assets/locale/{file}.json` - this is required for microservice context
2. `{root}/(apps | apps-business)/{app}/assets/locale/{file}.json` - this is required for monolyth context
3. `{root}/node_modules/@pe/{module}/assets/locale/{file}.json` - this is required for npm-installed packages. And this works recursively.

Translations extracted from these locations will be posted i18n server

**IMPORTANT**

Name of the json file will be used as a domain name, so please give it a self-explanatory name, like contacts.json, statistics.json, etc.
Yes, it contains actually English locale, but do not name it like en.json.

# PriceModule

Provice PriceComponent for beauty input of price in different currency

```angular2html
<pe-price [currency]="'USD'" // string // required
          [min]='0' // number // default is 0.0
          [max]='0' // number // default is 1000000.0
          [initialValue]="'234.30'" // number|string // default is '0.00', autoconverting
          [setValue]="setPriceInputValue" // PriceInputValueSetterType // mutate value on component lifecycle
          [autoFocus]="false" // boolean // default is false
          [disabled]="false" // boolean // default is false
          (priceValueChange)="handlePriceValue($event)" // PriceValueChangeEventInterface
</pe-price>
```

## Catch value

```ts
handlePriceValue({
  value,
  decimalValue,
  formattedValue
}: PriceValueChangeEventInterface): void {
  console.log('Price input value:', value, decimalValue, formattedValue);
}
```

## Set value

```ts
// Pass as `[initialValue]` attribute
const initialValue: number | string = '123.32';

// Or/And pass this setter as `[setValue]` attribute
const setPriceInputValue: Subject<PriceInputValueSetterType> = new Subject();

setPriceInputValue.next('123.12');
setPriceInputValue.next(123.12);

setPriceInputValue.next({ value: 123.12 });
setPriceInputValue.next({ value: '123.12' });

setPriceInputValue.next({ value: 123.12, cursorPosition: '123.12'.length });
setPriceInputValue.next({ value: '123.12', cursorPosition: '123.12'.length });
```

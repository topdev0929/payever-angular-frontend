# Counter module


```angular2html
<pe-counter
      [value]="10" // default is 0
      [minValue]="5" // default is 0
      [maxValue]="15" // default is 10000
      [smallField]="false" // default is false
      [readonly]="false" // default is false
      [autoFocus]="false" // default is false
      [blockDisplay]="block" // value for css rule "display", default is block
      [maxWidth]="'100%'" // default is 100%
      (counterValueChange)="handleCounterValue($event)" // event return value on change
></pe-counter>
```

## Catch value

```ts
handleCounterValue(value: number): void {
  console.log('Value', value);
}
```

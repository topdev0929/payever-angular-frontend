# Counter module


```angular2html
<pe-feedback
    [feedbackId] = "'feedback'" // unique id
    [value] = "" // default value on start
    [maxLength] = "10000" // max length of text in chars
    [minHeight] = "74" // min field height in px
    [maxHeight] = "162" // max field height in px
    [placeholderText] = "'Please enter your feedback'" // text for label
    [autoFocus] = "false" // auto focus on start
    (feedbackValueChange) = "handleFeedbackValue($event)" // handle value on input
></pe-feedback>
```

## Catch value

```ts
handleFeedbackValue(event: {event: MouseEvent}): void {
      console.log('Feedback input', event);
  }
```

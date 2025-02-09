# Mobile module

It contains tools for use for mobile browsers

## PreventDoubleTapZoomDirective directive

It prevent zoom on double click (tap) on iOS device browsers

### Use of PreventDoubleTapZoomDirective

Just put this directive to area. If any of contain childs hanlding double tap - find their biggest parent 'after' elements which breaks this behaviour with `(click)` (or same) handlers, and apply directive again.

```html
<section pePreventDoubleTapZoom>
  <!-- Your content here -->
</section>
```

## PreventDoubleTapZoomCdkOverlay

It automagically prevent zoom on all elements using `OverlayContainer` from `@angular/cdk` - datepicker, etc.

Under the hood it uses PreventDoubleTapZoomDirective with selector.

### Use of PreventDoubleTapZoomCdkOverlay

Just put this directive to one of root layouts, single per app

```html
<pe-prevent-double-tap-zoom-cdk-overlay></pe-prevent-double-tap-zoom-cdk-overlay>
```

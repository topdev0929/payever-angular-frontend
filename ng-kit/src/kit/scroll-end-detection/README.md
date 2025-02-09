# Scroll End Detection

Directive that detect when user scroll element to the bottom.

## Usage 

```html
<div scrollEndDetection (scrollEnd)="loadNextPage()"></div>
```

## Api

### Input

* heightDiff (default: 100) — number of pixels left to the end of element

### Output

* scrollDown - emits when a scroll has reach the end
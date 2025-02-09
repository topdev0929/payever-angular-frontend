# ParagraphEditorModule

```angular2html
<pe-paragraph-editor
    [isEditorActive]="isEditorActive"
    [finishButtonName]="'Done'"
    [onContentUpdate]="onContentChanged"
    (onEditorClosed)="onEditorClosed()">
    <p>some text</p>
</pe-paragraph-editor>
```

```ts
isEditorActive: boolean = true;
onContentChanged: Subject<void> = new Subject<void>();

onEditorClosed(): void {
    this.isEditorActive = false;
}

// Call this method when new paragraph has been added to the content
updateContent(): void {
    this.onContentChanged.next();
}
```

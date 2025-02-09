# Text Editor Module

Angular wrapper for text-editor.
Stores some native text-editor extensions for custom payever buttons.

### Usage

available as component:

```html
<pe-text-editor></pe-text-editor>
<pe-text-editor-toolbar></pe-text-editor-toolbar>
```

### Inputs

`options: TextEditor.CoreOptions` - object of native text-editor options to be passed
`placeholder: string` - placeholder
`editable: boolean` - input for state
`htmlText: boolean` - input text
`isOutlineNone: boolean` - input focus style state

### Outputs
`contentChange: string` - updated content (editor html)
`editorFocus: FocusEvent` - focus event
`editorBlur: BlurEvent` - blur event.


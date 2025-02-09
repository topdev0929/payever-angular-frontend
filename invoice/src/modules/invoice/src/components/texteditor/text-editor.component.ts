import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AppThemeEnum } from '@pe/common';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  ExecuteCommandAction,
  ExecuteCommands,
  TextDecorationInterface,
  TextOptionsInterface,
  ToolbarOptionsInterface
} from '../../common';
import * as Utils from '../../common/text-editor.utils';
import { CommandExecutorService } from './services/command-executor.service';
import { TextEditorService } from './services/text-editor.service';

@Component({
  selector: 'pe-text-editor',
  styleUrls: ['text-editor.component.scss'],
  templateUrl: 'text-editor.component.html',
  providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextEditorComponent),
    multi: true
  }],
  host: {
    "(focusin)": "onFocus(true)",
    "(focusout)": "onFocus(false)",
 },
 animations: [
  trigger('isFocusedLabel', [
    state(
      'true',
      style({
        height: 0,
        overflow: 'hidden',
      }),
    ),
    state(
      'false',
      style({
        // height: '16px',
      }),
    ),
    transition('true => false', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
    transition('false => true', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
  ]),
 ]
})
export class TextEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  savedRange: Range;
  hidePlaceholder: boolean = true;
  isFocused: boolean = false;

  @Input() theme = AppThemeEnum.default;
  @Input() editable: boolean = false;
  @Input() smartToolbar: boolean = true;
  @Input() placeholder: string;
  @Input() htmlText: string;
  @Input() color: string;
  @Input() align: string;
  @Input() fontSize: number;
  @Input() fontWeight: string;
  @Input() isOutlineNone: boolean = true;
  @Output() contentChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() editorBlur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output() editorFocus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output() editorClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() caretSet: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('textArea', { static: true }) textArea: ElementRef<HTMLElement>;
  @ViewChild('placeholderEl', { static: true }) placeholderElem: ElementRef<HTMLElement>;
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();
  private toolbarOtions: ToolbarOptionsInterface = {
    [ExecuteCommands.BOLD]: false,
    [ExecuteCommands.ITALIC]: false,
    [ExecuteCommands.UNDERLINE]: false,
    color: DEFAULT_FONT_COLOR,
    fontSize: DEFAULT_FONT_SIZE
  };

  constructor(private elementRef: ElementRef,
              private sanitizer: DomSanitizer,
              private renderer: Renderer2,
              public editorService: TextEditorService,
              private executorService: CommandExecutorService) {
  }
  onChange = (_: any) => {};
  onTouch: any = () => {}
  set value(val){  // this value is updated by programmatic changes if( val !== undefined && this.val !== val){
    this.htmlText = val;
    this.onChange(val);
    this.onTouch(val);
  }
  // onClick(event) {
  //   this.setFocus();
  // }
  onFocus(event) {
    this.hidePlaceholder = !event || !!this.htmlText;
    this.isFocused = true;
  }
  get value () {
    return this.htmlText;
  }
  writeValue(value: any): void {
    this.value = value;
    this.textArea.nativeElement.innerHTML = value;
    this.hidePlaceholder = !!value || !this.isFocused;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onContentPasted(event: ClipboardEvent): void {
    const text: string = event.clipboardData.getData('text');
    this.executorService.insertTextAtRange(text, this.shadowRange, this.shadowSelection);
    this.emitContentChange();
    this.handleToolbarOptions();
    event.preventDefault();
  }

  get shadowSelection(): Selection {
    return window.getSelection && window.getSelection();
  }

  get shadowRange(): Range {
    const contentEditable = document.activeElement.getAttribute('contenteditable');
    const range = contentEditable? Utils.getRange(this.shadowSelection) : this.savedRange;
    return range;
  }

  ngAfterViewInit(): void {
    this.editorService.triggerCommand$.pipe(takeUntil(this.destroyed$)).subscribe((action: ExecuteCommandAction) => {
      if (!this.editable) {
        return ;
      }
      switch (action.key) {
        case ExecuteCommands.FONT_SIZE:
          if (!this.savedRange) {
            this.setCaretToEnd();
          } else {
            Utils.restoreSelection(this.savedRange, this.shadowSelection);
          }
          this.toolbarOtions.fontSize = Number(action.value);
          this.executorService.setFontSize(Number(action.value), this.renderer, this.textArea.nativeElement);
          break;
        case ExecuteCommands.INSERT_LINK:
          Utils.restoreSelection(this.savedRange, this.shadowSelection);
          this.executorService.insertLink(action.value, action.options, this.renderer);
          break;
        case ExecuteCommands.SET_FOCUS:
          this.setFocus();
          break;
        case ExecuteCommands.SET_CARET:
          this.setCaret();
          break;
        case ExecuteCommands.TEXT_COLOR:
          this.toolbarOtions.color = action.value;
          if (!Utils.hasList()) {
            if (this.savedRange && this.savedRange.collapsed && !this.executorService.isInLastPosition()) {
              this.executorService.execute(ExecuteCommands.SELECT_ALL);
            } else {
              Utils.restoreSelection(this.savedRange, this.shadowSelection);
            }
            this.executorService.execute(action.key, action.value);
          } else {
            this.executorService.setListColor(this.savedRange, action.value, this.renderer);
          }
          if (this.shadowRange && !this.shadowRange.collapsed) {
            this.executorService.setSelectionLinksColor(action.value, this.shadowRange, this.shadowSelection, this.renderer);
          }
          break;
        default:
          Utils.restoreSelection(this.savedRange, this.shadowSelection);
          this.executorService.execute(action.key, action.value);
      }

      if ([ExecuteCommands.BOLD, ExecuteCommands.ITALIC, ExecuteCommands.UNDERLINE].includes(action.key)) {
        this.toolbarOtions[action.key] = !this.toolbarOtions[action.key];
      }
      if ([ExecuteCommands.JUSTIFY_RIGHT, ExecuteCommands.JUSTIFY_CENTER, ExecuteCommands.JUSTIFY_LEFT, ExecuteCommands.JUSTIFY_FULL].includes(action.key)) {
        this.toolbarOtions.justify = action.key;
      }
      if ([ExecuteCommands.LIST_UNORDERED, ExecuteCommands.LIST_ORDERED].includes(action.key)) {
        this.toolbarOtions.list = action.key;
        if (this.savedRange.collapsed) {
          if (this.shadowRange) {
            this.shadowRange.setStartAfter(this.savedRange.commonAncestorContainer);
          } else {
            Utils.restoreSelection(this.savedRange, this.shadowSelection);
          }
        }
      }

      this.emitContentChange();
      this.saveSelection();
    });
    if (this.htmlText) {
      this.textArea.nativeElement.innerHTML = this.htmlText;
    }
  }

  setFocus(): void {
    this.textArea.nativeElement.focus();
  }

  setCaret(): void {
    if (this.savedRange) {
      Utils.restoreSelection(this.savedRange, this.shadowSelection);
      this.saveSelection();
    } else {
      this.setCaretToEnd();
    }
    this.handleToolbarOptions(true);
    this.caretSet.emit();
  }

  setCaretToEnd(): void {
    this.executorService.setCaretToEnd(this.textArea.nativeElement);
    this.saveSelection();
    this.handleToolbarOptions();
  }

  setDefault(): void {
    this.textArea.nativeElement.innerHTML = '<span>&#8203</span>';
  }

  selectAll(): void {
    this.executorService.execute(ExecuteCommands.SELECT_ALL);
  }

  onTextAreaBlur(event: FocusEvent): void {
    /** save selection if focussed out */
    this.htmlText = (event.target as HTMLElement).innerText.trim();
    if (this.htmlText !== '') {
      Utils.clean(this.textArea.nativeElement, this.renderer);
      this.saveSelection();
    }
    this.editorBlur.emit(event);
  }

  onTextAreaFocus(event: FocusEvent): void {
    this.editorFocus.emit(event);
  }

  onTextAreaClick(event: MouseEvent): void {
    if (this.editable) {
      this.saveSelection();
      this.handleToolbarOptions();
      if (Utils.getRange(this.shadowSelection) === null) {
        this.setCaretToEnd();
      }
    }
    this.editorClick.emit(event);
  }

  onMouseLeave(): void {
    this.saveSelection();
    if (this.savedRange && !this.savedRange.collapsed) {
      this.handleToolbarOptions();
    }
  }

  onContentChanged(event: any): void {
    if (event.data !== null && event.data !== undefined && Utils.isInLastPosition(this.savedRange)) {
      const options: TextOptionsInterface = {};
      const textColor: string = Utils.hasFontColor();
      const fontSize: number = Utils.fontSizeToNumber(Utils.hasFontSize(this.shadowSelection));
      const decorations: TextDecorationInterface = Utils.hasDecoration();
      options.color = this.toolbarOtions.color !== textColor ? this.toolbarOtions.color : undefined;
      options.fontSize = this.toolbarOtions.fontSize !== fontSize ? this.toolbarOtions.fontSize : undefined;
      let hasDecChange: boolean = false;
      for (const key in decorations) {
        if (decorations[key] !== this.toolbarOtions[key]) {
          options[key] = this.toolbarOtions[key];
          hasDecChange = true;
        }
      }

      if (options.color || options.fontSize || hasDecChange) {
        this.executorService.insertText(event.data,  options, this.renderer, this.textArea.nativeElement);
      }
      this.editorService.toggleToolbarAction$.next({action: 'textDecoration', value: decorations});
      this.saveSelection();
    }
    this.emitContentChange();
    this.handleToolbarOptions();
  }

  saveSelection(): void {
    if (this.editable) {
      this.executorService.savedRange = this.savedRange = this.shadowRange;
    }
  }

  removeRange(): void {
    Utils.removeRange(this.shadowSelection);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleToolbarOptions(skipColor?: boolean): void {
    if (this.editable) {
      setTimeout(() => {
        const decorations: TextDecorationInterface = Utils.hasDecoration();
        this.toolbarOtions = {...this.toolbarOtions, ...decorations};
        this.toolbarOtions.justify = Utils.hasJustify();
        this.toolbarOtions.list = Utils.hasList();
        this.editorService.toggleToolbarAction$.next({action: 'contentList', value: this.toolbarOtions.list});
        this.editorService.toggleToolbarAction$.next({action: 'textDecoration', value: decorations});
        this.editorService.toggleToolbarAction$.next({action: 'justifyContent', value: this.toolbarOtions.justify});

        const fontSize: number = Utils.fontSizeToNumber(Utils.hasFontSize(this.shadowSelection));
        if (fontSize) {
          this.editorService.toggleToolbarAction$.next({action: 'currentFontSize', value: fontSize});
          this.toolbarOtions.fontSize = fontSize;
        }
        // change toolbar color to selected text color
        const fontColor: string = Utils.hasFontColor();
        if (!skipColor && fontColor && fontColor !== this.color &&
          (!Utils.isInLastPosition(this.savedRange) || Utils.isTextSelected(this.savedRange))) {
          this.editorService.toggleToolbarAction$.next({action: 'currentFontColor', value: fontColor});
          this.toolbarOtions.color = fontColor;
        }
      });
    }
  }

  private emitContentChange(): void {
    this.htmlText = this.textArea.nativeElement.innerHTML;
    this.hidePlaceholder = !!this.htmlText;
    this.onChange(this.htmlText);
    this.contentChange.emit(this.textArea.nativeElement.innerHTML);
  }

}

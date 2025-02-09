import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  ExecuteCommandAction,
  TextEditorComponent,
  TextEditorPlaceholderItem,
  TextEditorService,
  TextEditorToolbarComponent,
} from '@pe/text-editor';

import { CONTACT_PLACEHOLDER_DATA, MailActionDataType } from '../../../../models/rules.model';
import { AbstractActionForm } from '../abstract-action-form.component';

const TOOLBAR_PADDING = 15;
const EDITOR_SIZE = {
  focusedCompactHeight: 120,
  focusedHeight: 180,
  compactHeight: 160,
  height: 220,
};
@Component({
  selector: 'pe-rule-action-email',
  templateUrl: './rule-action-email.component.html',
  styleUrls: ['./rule-action-email.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleActionEmailComponent extends AbstractActionForm implements OnInit {
  @ViewChild('editorToolbar') editorToolbar: TextEditorToolbarComponent;
  @ViewChild('editorToolbar', { read: ElementRef }) editorToolbarElement: ElementRef;
  @ViewChild('textEditor') textEditor: TextEditorComponent;

  @Input() defaultData: MailActionDataType;

  editorFocused: boolean;
  toolbarHeight = 0;
  showCCError = false;
  ccChips = [];
  placeholderItems: TextEditorPlaceholderItem[] = CONTACT_PLACEHOLDER_DATA;
  ccControl = new FormControl(null, [Validators.email]);

  private textEditorService: TextEditorService = this.injector.get(TextEditorService);
  private renderer: Renderer2 = this.injector.get(Renderer2);
  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  @HostBinding('id') hostId = 'editor-description';
  @HostListener('document:mousedown', ['$event']) onClick(event: any): void {
    if (!event.target.closest(`#${this.hostId}`)) {
      this.editorFocused = false;
      this.recalculateHeight();
    }
  }

  ngOnInit(): void {
    const emailForm = new FormGroup({
      subject: new FormControl(this.defaultData?.email?.subject, [Validators.required]),
      body: new FormControl(this.defaultData?.email?.body, [Validators.required]),
      cc: new FormControl(this.defaultData?.email?.cc),
    });
    this.formGroup.addControl('email', emailForm);
    this.ccChips = this.defaultData?.email?.cc?.split(', ') || [];
  }

  onTextEditorAction(action: ExecuteCommandAction): void {
    this.textEditorService.triggerCommand$.next(action);
  }

  onAddValue(): void {
    const value = this.ccControl.value.trim();
    this.showCCError = this.ccControl.hasError('email');
    
    if (!this.showCCError && value) {
      this.ccChips = [...new Set([...this.ccChips, value])];
      this.formGroup.get('email.cc').setValue(this.ccChips.join(', '));
      this.ccControl.reset();
    }
    this.cdr.detectChanges();
  }

  onChipDelete(index: number) {
    this.ccChips.splice(index, 1);
  }

  private recalculateHeight(): void {
    if (this.textEditor) {
      const height: number = EDITOR_SIZE.focusedCompactHeight;
      this.renderer.setStyle(this.textEditor.textArea.nativeElement, 'height', `${height}px`);
    }
    if (this.editorToolbarElement) {
      const toolbarHeight = this.editorToolbarElement.nativeElement.getBoundingClientRect().height;
      this.toolbarHeight = this.editorFocused ? toolbarHeight + TOOLBAR_PADDING : 0;
    }
  }
}

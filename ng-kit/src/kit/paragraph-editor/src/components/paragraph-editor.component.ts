import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { isNil } from 'lodash-es';
import { Subject ,  Subscription } from 'rxjs';
import { ParagraphEditorActionInterface, ParagraphEditorGroupActionInterface } from '../..';
import { UI_PARAGRAPH_EDITOR_PRESETS } from './paragraph-editor-presets';

@Component({
  selector: 'pe-paragraph-editor',
  templateUrl: './paragraph-editor.component.html',
  styleUrls: ['./paragraph-editor.component.scss']
})
export class ParagraphEditorComponent implements AfterContentInit, OnInit, OnDestroy {
  @Input() isEditorActive: boolean = true;
  @Input() finishButtonName: string = 'Done';
  @Input() onContentUpdate: Subject<void> = null;

  @Output() onEditorClosed: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('contentWrapper', { static: true }) contentWrapper: ElementRef;

  groupActions: ParagraphEditorGroupActionInterface[] = UI_PARAGRAPH_EDITOR_PRESETS;

  private wasInit: boolean = false;
  private content: HTMLElement;
  private contentUpdateSubscription: Subscription;

  ngOnInit(): void {
    if (!isNil(this.onContentUpdate)) {
      this.contentUpdateSubscription = this.onContentUpdate.subscribe(() => {
        this.reassignStyles();
      });
    }
  }

  ngOnDestroy(): void {
    if (!isNil(this.contentUpdateSubscription)) {
      this.contentUpdateSubscription.unsubscribe();
    }
  }

  ngAfterContentInit(): void {
    this.init();
  }

  onSelectGroup(groupAction: ParagraphEditorGroupActionInterface): void {
    this.groupActions.forEach((group: ParagraphEditorGroupActionInterface) => {
      group.isSelected = false;
    });

    groupAction.isSelected = true;
  }

  get selectedGroup(): ParagraphEditorGroupActionInterface {
    return this.groupActions.find((group: ParagraphEditorGroupActionInterface) => group.isSelected);
  }

  onActionSelected(groupAction: ParagraphEditorGroupActionInterface, action: ParagraphEditorActionInterface): void {
    if (!action.isActive) {
      const activeAction: ParagraphEditorActionInterface = groupAction.actions.find((act: ParagraphEditorActionInterface) => act.isActive);

      if (!isNil(activeAction)) {
        activeAction.isActive = false;
        this.removeClass(activeAction.cssClass);
      }

      action.isActive = true;
      this.setClass(action.cssClass);
    }
  }

  onFinishButtonClick(): void {
    this.onEditorClosed.emit();
  }

  private init(): void {
    if (!isNil(this.contentWrapper) && !isNil(this.contentWrapper.nativeElement)) {
      this.wasInit = true;

      this.content = this.contentWrapper.nativeElement;

      this.groupActions.forEach((groupAction: ParagraphEditorGroupActionInterface) => {
        const activeAction: ParagraphEditorActionInterface =
          groupAction.actions.find((action: ParagraphEditorActionInterface) => this.content.classList.contains(action.cssClass));

        if (isNil(activeAction)) {
          groupAction.actions[0].isActive = true;
          this.setClass(groupAction.actions[0].cssClass);
        } else {
          activeAction.isActive = true;
          this.setClass(activeAction.cssClass);
        }
      });
    }
  }

  private reassignStyles(): void {
    if (this.wasInit) {
      this.groupActions.forEach((groupAction: ParagraphEditorGroupActionInterface) => {
        groupAction.actions.forEach((action: ParagraphEditorActionInterface) => {
          if (action.isActive) {
            this.onActionSelected(groupAction, action);
          }
        });
      });
    } else {
      this.init();
    }
  }

  private setClass(className: string): void {
    this.content.classList.add(className);
  }

  private removeClass(className: string): void {
    this.content.classList.remove(className);
  }
}

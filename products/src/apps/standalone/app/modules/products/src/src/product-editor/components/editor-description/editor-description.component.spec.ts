import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, Output, Renderer2, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';

import { TranslatePipe, TranslateService } from '@pe/i18n';

import { ExecuteCommandAction, TextEditorService } from '../../../texteditor';
import { EditorDescriptionComponent } from './editor-description.component';

@Component({
  selector: 'pe-text-editor-toolbar',
  template: '',
})
class MockedPeTextEditorToolbarComponent {
  @Input()
  hideLink: any;
  @Input()
  hideOpenNewTab: any;
  @Input()
  hideColorPicker: any;
  @Input()
  hideFontSize: any;
  @Output()
  actionClicked: EventEmitter<any> = new EventEmitter();
  @Output()
  click: EventEmitter<any> = new EventEmitter();
}

@Component({
  selector: 'pe-text-editor',
  template: '<div #textArea></div>',
})
class MockedPeTextEditorComponent {
  @Input()
  htmlText: any;
  @Input()
  editable: any;
  @Output()
  contentChange: EventEmitter<any> = new EventEmitter();
  @Output()
  editorFocus: EventEmitter<any> = new EventEmitter();
  @Output()
  editorClick: EventEmitter<any> = new EventEmitter();
  @ViewChild('textArea')
  textArea: ElementRef;
}

describe('EditorDescriptionComponent', () => {
  let component: EditorDescriptionComponent;
  let fixture: ComponentFixture<EditorDescriptionComponent>;

  let textEditorServiceSpy: Partial<TextEditorService>;

  beforeEach(() => {
    textEditorServiceSpy = {
      toggleToolbarAction$: new Subject(),
      triggerCommand$: new Subject(),
    };

    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
      ],
      providers: [
        TranslateService,
        Injector,
        ChangeDetectorRef,
        Renderer2,
        { provide: TextEditorService, useValue: textEditorServiceSpy },
      ],
      declarations: [
        TranslatePipe,

        MockedPeTextEditorComponent,
        MockedPeTextEditorToolbarComponent,
        EditorDescriptionComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('description setter should toggle hasDescriptionText', () => {
    component.description = '';

    expect(component.hasDescriptionText).toBeFalsy();

    component.description = 'some text';

    expect(component.hasDescriptionText).toBeTruthy();
  });

  it('compactSize setter should call recalculate height', () => {
    const renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2);
    const setStyleSpy = spyOn(renderer, 'setStyle');

    component.compactSize = true;

    expect(setStyleSpy).toHaveBeenCalled();

    setStyleSpy.calls.reset();

    component.compactSize = false;

    expect(setStyleSpy).toHaveBeenCalled();
  });

  it('compactSize setter should call recalculate height', () => {
    component.editorFocus();

    expect(component.editorFocused).toBeTruthy();
  });

  it('compactSize setter should call recalculate height', () => {
    const textEditorService = TestBed.get(TextEditorService);
    const triggerCommandSpy = spyOn(textEditorService.triggerCommand$, 'next');

    component.onTextEditorAction({} as ExecuteCommandAction);

    expect(triggerCommandSpy).toHaveBeenCalled();
  });

  it('compactSize setter should call recalculate height', () => {
    const valueChangeSpy = spyOn(component.valueChanged, 'emit');

    component.onDescriptionChange('');

    expect(valueChangeSpy).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PeDestroyService, PE_ENV } from '@pe/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { PeMessageService } from '../../../services';
import { BubbleComponent } from './bubble.component';

describe('BubbleComponent', () => {

  let fixture: ComponentFixture<BubbleComponent>;
  let component: BubbleComponent;
  let liveChatBubbleClickedSubject: Subject<boolean>;
  let bubbleSubject: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject<void>();

    liveChatBubbleClickedSubject = new Subject<boolean>();
    bubbleSubject = new BehaviorSubject({});
    const peMessageServiceMock = {
      liveChatBubbleClickedStream$: liveChatBubbleClickedSubject,
      bubble$: bubbleSubject,
    };

    const envServiceMock = {
      custom: {
        cdn: 'c-cdn',
      },
    };

    TestBed.configureTestingModule({
      declarations: [BubbleComponent],
      providers: [
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PE_ENV, useValue: envServiceMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(BubbleComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    component.ngOnInit();

    expect(component.opened).toBe(false);
    expect(component.op).toBe(false);
    expect(component.cornerStyle).toEqual('rounded');

    liveChatBubbleClickedSubject.next(true);
    expect(component.opened).toBe(true);
    expect(component.op).toBe(true);

    bubbleSubject.next({ style: 'style' });
    expect(component.cornerStyle).toEqual('style');

  });

  it('should handle on click', () => {

    const nextSpy = spyOn(liveChatBubbleClickedSubject, 'next');

    component.opened = false;
    component.onClick();

    expect(component.opened).toBe(true);
    expect(component.op).toBe(true);
    expect(nextSpy).toHaveBeenCalledWith(true);

  });

});

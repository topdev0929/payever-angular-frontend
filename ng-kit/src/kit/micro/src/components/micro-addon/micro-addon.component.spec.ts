import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MicroLoaderService } from '../../services/micro-loader.service';
import { By, DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { MicroAddonComponent } from './micro-addon.component';
import { MessageBusService } from '../../services/message-bus.service';

describe('SubmicroContainerComponent', () => {

  @Component({
    selector: 'test-container',
    template: `
      <pe-micro-addon
        [url]="url"
        [bindings]="bindings"
        [isReady]="isReady"
        [isFitToOffsetSize]="isFitToOffsetSize"
        [borderTopLeftRadius]="borderTopLeftRadius"
        [borderTopRightRadius]="borderTopRightRadius"
        [borderBottomLeftRadius]="borderBottomLeftRadius"
        [borderBottomRightRadius]="borderBottomRightRadius"
        [forceHeight]="forceHeight"
        [forceMaxHeight]="forceMaxHeight"
        [isForceHidden]="isForceHidden"
        (message)="message(event)"
        (load)="load()">
      </pe-micro-addon>
    `
  })
  class TestContainerComponent {
    url: string = 'url';
    bindings: any = [{
      channel: 'channel',
      event: 'event',
      data: 'data'
    }];
    isReady: boolean = true;
    isFitToOffsetSize: boolean = true;
    borderTopLeftRadius: number = 5;
    borderTopRightRadius: number = 5;
    borderBottomLeftRadius: number = 5;
    borderBottomRightRadius: number = 5;
    forceHeight: number = 5;
    forceMaxHeight: number = 5;
    isForceHidden: boolean = true;
    message(): void {
      return;
    }
    load(): void {
      return;
    }
  }

  let microLoaderService: any;
  let messageBusService: any;

  let testFixture: ComponentFixture<any>;
  let testComponent: TestContainerComponent;
  let testDebugElem: DebugElement;
  let component: MicroAddonComponent;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        TestContainerComponent,
        MicroAddonComponent
      ],
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: () => 'safeString',
            bypassSecurityTrustResourceUrl : () => 'safeString'
          }
        },
        {
          provide: MicroLoaderService,
          useValue: {
            isScriptLoadedbyCode: jasmine.createSpy(),
            loadBuild: jasmine.createSpy().and.returnValue(of(null)),
            loadInnerMicroBuild: jasmine.createSpy().and.returnValue(of(null))
          }
        },
        {
          provide: MessageBusService,
          useValue: {
            observe: jasmine.createSpy(),
            send: jasmine.createSpy()
          }
        }
      ]
    });

    microLoaderService = TestBed.get(MicroLoaderService);
    messageBusService = TestBed.get(MessageBusService);

    testFixture = TestBed.createComponent(TestContainerComponent);
    testComponent = testFixture.componentInstance;
    testDebugElem = testFixture.debugElement;
    component = testDebugElem.query(By.css('pe-micro-addon')).componentInstance;
  });

  it('ngOnChanges should call MessageBusService send method with bindings data', () => {
    messageBusService.send.and.stub();
    messageBusService.observe.and.returnValue(of(undefined));

    testFixture.detectChanges();

    expect(messageBusService.send).toHaveBeenCalledWith(
      component.iframe.nativeElement.contentWindow,
      testComponent.bindings[0].channel,
      testComponent.bindings[0].event,
      testComponent.bindings[0].data,
    );
  });

  it('ngOnChanges should call MessageBusService send method with bindings data if isReady is not changed', () => {
    messageBusService.send.and.stub();
    messageBusService.observe.and.returnValue(of(undefined));

    testFixture.detectChanges();

    const bindings: any = [{
      channel: '1',
      event: '2',
      data: '3'
    }];
    testComponent.bindings = bindings;
    testFixture.detectChanges();

    expect(messageBusService.send).toHaveBeenCalledWith(
      component.iframe.nativeElement.contentWindow,
      bindings[0].channel,
      bindings[0].event,
      bindings[0].data,
    );
  });

  it('ngOnInit should add listeners', () => {
    messageBusService.send.and.stub();
    messageBusService.observe.and.returnValue(of(null));
    const setterSpy: jasmine.Spy = spyOnProperty(component, 'isFullscreen', 'set').and.stub();
    const messageSpy: jasmine.Spy = spyOn(testComponent, 'message').and.stub();

    testFixture.detectChanges();

    expect(messageSpy).toHaveBeenCalled();
    expect(setterSpy).toHaveBeenCalledTimes(2);
    expect(setterSpy.calls.first().args[0]).toEqual(true);
    expect(setterSpy.calls.mostRecent().args[0]).toEqual(false);
  });

  it('ngAfterViewInit should add listener and emit load', () => {
    messageBusService.send.and.stub();
    messageBusService.observe.and.returnValue(of(null));
    const loadSpy: jasmine.Spy = spyOn(testComponent, 'load').and.stub();

    testFixture.detectChanges();
    component.ngAfterViewInit();
    component.iframe.nativeElement.dispatchEvent(new Event('load'));

    expect(loadSpy).toHaveBeenCalled();
  });
});

import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MicroLoaderService } from '../../services/micro-loader.service';
import { By } from '@angular/platform-browser';
import { LoadMicroComponent } from './load-micro.component';
import { of } from 'rxjs';

describe('SubmicroContainerComponent', () => {

  @Component({
    selector: 'test-container',
    template: `
      <pe-load-micro
        [micro]="micro"
        [innerMicro]="innerMicro"
        [isShowLoader]="isShowLoader"
        (isLoading)="isLoading()">
      </pe-load-micro>
    `
  })
  class TestContainerComponent {
    micro: string = 'micro';
    innerMicro: any = {
      micro: 'micro',
      innerMicro: 'innerMicro'
    };
    isShowLoader: boolean = true;

    isLoading = () => '';
  }

  let microLoaderService: any;

  let testFixture: ComponentFixture<any>;
  let testComponent: TestContainerComponent;
  let testDebugElem: DebugElement;
  let component: LoadMicroComponent;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        TestContainerComponent,
        LoadMicroComponent
      ],
      providers: [
        {
          provide: MicroLoaderService,
          useValue: {
            isScriptLoadedbyCode: jasmine.createSpy(),
            loadBuild: jasmine.createSpy().and.returnValue(of(null)),
            loadInnerMicroBuild: jasmine.createSpy().and.returnValue(of(null))
          }
        }
      ]
    });

    microLoaderService = TestBed.get(MicroLoaderService);

    testFixture = TestBed.createComponent(TestContainerComponent);
    testComponent = testFixture.componentInstance;
    testDebugElem = testFixture.debugElement;
    component = testDebugElem.query(By.css('pe-load-micro')).componentInstance;
  });

  it('micro setter should next(true) from isLoadingSubject, call loadBuild, and make next(false)', () => {
    const nextSpy: jasmine.Spy = spyOn(component.isLoadingSubject, 'next').and.stub();

    testFixture.detectChanges();

    expect(nextSpy.calls.first().args[0]).toBeTruthy();
    expect(nextSpy.calls.mostRecent().args[0]).toBeFalsy();
    expect(microLoaderService.loadBuild).toHaveBeenCalledWith(testComponent.micro);
    nextSpy.calls.reset();
  });

  it('innerMicro setter should next(true) from isLoadingSubject, call loadInnerMicroBuild, and make next(false)', () => {
    const nextSpy: jasmine.Spy = spyOn(component.isLoadingSubject, 'next').and.stub();

    testFixture.detectChanges();

    expect(nextSpy.calls.first().args[0]).toBeTruthy();
    expect(nextSpy.calls.mostRecent().args[0]).toBeFalsy();
    expect(microLoaderService.loadInnerMicroBuild).toHaveBeenCalledWith(testComponent.innerMicro.micro, testComponent.innerMicro.innerMicro);
    nextSpy.calls.reset();
  });

  it('ngOnInit should next to isLoadingEmitter', () => {
    const isLoadingSpy: jasmine.Spy = spyOn(testComponent, 'isLoading').and.stub();

    testFixture.detectChanges();
    testComponent.innerMicro = {
      micro: '1',
      innerMicro: '2'
    };
    testComponent.micro = '1';
    testFixture.detectChanges();

    expect(isLoadingSpy.calls.count()).toBe(5); // 5 cause first one is false from BehaviourSubject
  });

  it('isShowLoader should display/hide div with "<br><br><br><br>"', () => {
    testFixture.detectChanges();
    expect(testDebugElem.query(By.css('.spinner_32'))).toBeDefined();

    testComponent.isShowLoader = false;
    testFixture.detectChanges();
    expect(testDebugElem.query(By.css('.spinner_32'))).toBeNull();
  });
});

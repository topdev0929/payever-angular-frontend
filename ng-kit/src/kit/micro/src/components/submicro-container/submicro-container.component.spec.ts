import { Component, ChangeDetectorRef, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SubmicroContainerComponent } from './submicro-container.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MicroLoaderService } from '../../services/micro-loader.service';
import { MicroRegistryService } from '../../services/micro-registry.service';
import { of } from 'rxjs';
import { PlatformService } from '../../../../common/src/services/platform.service';
import { By } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';

describe('SubmicroContainerComponent', () => {

  @Component({
    selector: 'test-container',
    template: `
      <pe-submicro-container
        [fullScreen]="fullScreen"
        [handleCloseEvents]="handleCloseEvents"
        [submicro]="submicro">
      </pe-submicro-container>
    `
  })
  class TestContainerComponent {
    fullScreen: boolean = false;
    handleCloseEvents: boolean = false;
    submicro: string = 'submicro';
  }

  let microLoaderService: any;
  let microRegistryService: any;
  let platformService: any;

  let testFixture: ComponentFixture<any>;
  let testComponent: TestContainerComponent;
  let testDebugElem: DebugElement;
  let component: SubmicroContainerComponent;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([])
      ],
      declarations: [
        TestContainerComponent,
        SubmicroContainerComponent
      ],
      providers: [
        ChangeDetectorRef,
        {provide: APP_BASE_HREF, useValue : '/' },
        {
          provide: MicroLoaderService,
          useValue: {
            isScriptLoadedbyCode: jasmine.createSpy()
          }
        },
        {
          provide: MicroRegistryService,
          useValue: {
            getMicroConfig: jasmine.createSpy(),
            loadBuild: jasmine.createSpy().and.returnValue(of({
              code: 'code'
            }))
          }
        },
        {
          provide: PlatformService,
          useValue: {
            submicroClose$: of(null)
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({fullScreen: true})
          }
        }
      ]
    });

    microLoaderService = TestBed.get(MicroLoaderService);
    microRegistryService = TestBed.get(MicroRegistryService);
    platformService = TestBed.get(PlatformService);

    testFixture = TestBed.createComponent(TestContainerComponent);
    testComponent = testFixture.componentInstance;
    testDebugElem = testFixture.debugElement;
    component = testDebugElem.query(By.css('pe-submicro-container')).componentInstance;
  });

  it('ngOnInit should add tag to micro container if submicro and config are provided', () => {
    microLoaderService.isScriptLoadedbyCode.and.returnValue(true);
    const windowSpy: jasmine.Spy = spyOn(window, 'dispatchEvent').and.stub();
    const config: any = {
      tag: 'newTag',
      code: 'code'
    };
    microRegistryService.getMicroConfig.and.returnValue(config);

    testFixture.detectChanges();

    expect(microLoaderService.isScriptLoadedbyCode).toHaveBeenCalledWith(config.code);
    expect(windowSpy).toHaveBeenCalled();
    expect(microRegistryService.getMicroConfig).toHaveBeenCalledWith(testComponent.submicro);
    expect(component.microContainer.nativeElement.innerHTML).toBe(config.tag);
  });

  it('ngOnInit should add tag to micro container and get submicro from location if config is provided', () => {
    testComponent.submicro = '';
    const submicro: string = location.pathname.split('/')[location.pathname.split('/').length - 1];
    microLoaderService.isScriptLoadedbyCode.and.returnValue(true);
    const windowSpy: jasmine.Spy = spyOn(window, 'dispatchEvent').and.stub();
    const config: any = {
      tag: 'newTag',
      code: 'code'
    };
    microRegistryService.getMicroConfig.and.returnValue(config);

    testFixture.detectChanges();

    expect(microLoaderService.isScriptLoadedbyCode).toHaveBeenCalledWith(config.code);
    expect(windowSpy).toHaveBeenCalled();
    expect(microRegistryService.getMicroConfig).toHaveBeenCalledWith(submicro);
    expect(component.microContainer.nativeElement.innerHTML).toBe(config.tag);
  });

  it('ngOnInit should add loadBuild if script is not loaded by code', () => {
    microLoaderService.isScriptLoadedbyCode.and.returnValue(false);
    const windowSpy: jasmine.Spy = spyOn(window, 'dispatchEvent').and.stub();
    const config: any = {
      tag: 'newTag',
      code: 'code'
    };
    microRegistryService.getMicroConfig.and.returnValue(config);

    testFixture.detectChanges();

    expect(microLoaderService.isScriptLoadedbyCode).toHaveBeenCalledWith(config.code);
    expect(windowSpy).toHaveBeenCalled();
    expect(microRegistryService.getMicroConfig).toHaveBeenCalledWith(testComponent.submicro);
    expect(microRegistryService.loadBuild).toHaveBeenCalledWith(config);
    expect(component.microContainer.nativeElement.innerHTML).toBe(config.tag);
  });

  it('ngOnInit should call console.error if there is no config', () => {
    microLoaderService.isScriptLoadedbyCode.and.returnValue(true);
    const config: any = null;
    microRegistryService.getMicroConfig.and.returnValue(config);
    const consoleSpy: jasmine.Spy = spyOn(console, 'error').and.stub();

    testFixture.detectChanges();

    expect(microRegistryService.getMicroConfig).toHaveBeenCalledWith(testComponent.submicro);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('ngOnInit should set fullScreen to true if activatedRoute.data.fullscreen is true', () => {
    testFixture.detectChanges();

    expect(component.fullScreen).toBeTruthy();
  });

  it('ngOnInit should call submicroClose$ if handleCloseEvents is true', () => {
    const pipeSpy: jasmine.Spy = spyOn(platformService.submicroClose$, 'pipe').and.callThrough();
    testFixture.detectChanges();

    expect(pipeSpy).not.toHaveBeenCalled();
    expect(component.hidden).toBeFalsy();

    testComponent.handleCloseEvents = true;
    testFixture.detectChanges();
    component.ngOnInit();

    expect(pipeSpy).toHaveBeenCalled();
    expect(component.hidden).toBeTruthy();
  });
});

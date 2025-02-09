import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MicroReturnComponent } from './micro-return.component';
import { PlatformService } from '@pe/ng-kit/src/kit/common';

describe('MicroReturnComponent', () => {
  let component: MicroReturnComponent;
  let fixture: ComponentFixture<MicroReturnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [MicroReturnComponent],
      providers: [
        {
          provide: PlatformService,
          useValue: {
            dispatchEvent: (value: any) => value,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => {},
            url: 'test-url',
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MicroReturnComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init without errors', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should call PlatformService dispatchEvent on init without errors', fakeAsync(() => {
    const platformService = TestBed.get(PlatformService);
    const platformServiceSpy = spyOn(platformService, 'dispatchEvent');
    component.ngOnInit();
    tick();

    expect(platformServiceSpy).toHaveBeenCalledTimes(1);
    expect(platformServiceSpy).toHaveBeenCalledWith({
      target: 'browser_back_event',
      action: 'test-url',
    });
  }));
});

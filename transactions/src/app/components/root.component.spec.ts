import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import {
  NO_ERRORS_SCHEMA,
  TestabilityRegistry,
  ElementRef,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { RootComponent } from './root.component';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';

describe('RootComponent', () => {
  let component: RootComponent;
  let fixture: ComponentFixture<RootComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [RootComponent],
      providers: [
        {
          provide: PlatformHeaderService,
          useValue: {},
        },
        {
          provide: TestabilityRegistry,
          useValue: {
            unregisterApplication: () => {},
          },
        },
        {
          provide: ElementRef,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RootComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call unregister on destroy without errors', () => {
    const testabilityRegistry = TestBed.get(TestabilityRegistry);
    const testabilityRegistrySpy = spyOn(
      testabilityRegistry,
      'unregisterApplication'
    );
    component.ngOnDestroy();
    expect(testabilityRegistrySpy).toHaveBeenCalledTimes(1);
  });

  it('should check is devMode without errors', () => {
    expect(component.isDevMode).toBeTruthy();
  });
});

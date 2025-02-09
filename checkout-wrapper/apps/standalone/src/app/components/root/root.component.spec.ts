import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';

import { LoaderService } from '@pe/checkout/core/loader';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '../../../../../../libs/shared/testing/src';

import { RootComponent } from './root.component';

describe('RootComponent', () => {
  let loaderService: LoaderService;
  let fixture: ComponentFixture<RootComponent>;
  let component: RootComponent;

  const sanitizer = {
    bypassSecurityTrustHtml: jest.fn(),
  };

  const getElementById = jest.fn();
  let DivElement: HTMLDivElement;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        RootComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        LoaderService,
        { provide: DomSanitizer, useValue: sanitizer },
      ],
    });
  }));

  beforeEach(() => {
    loaderService = TestBed.inject(LoaderService);
    fixture = TestBed.createComponent(RootComponent);
    component = fixture.componentInstance;

    DivElement = fixture.debugElement.query(By.css('div')).nativeElement;
    window.document.getElementById = getElementById.mockReturnValue(DivElement);
  });

  it('should create the app', () => {
    expect(component)
      .toBeTruthy();
  });


  it('should switch on loader when LoaderService send True', () => {
    loaderService.loaderGlobal = true;

    component.animationState$.subscribe({
      next: (state: string) => {
        expect(state).toBe('in');
      },
    });
  });

  it('should switch off loader when LoaderService send False', () => {
    loaderService.loaderGlobal = false;

    component.animationState$.subscribe({
      next: (state: string) => {
        expect(state).toBe('out');
      },
    });
  });

  it('should handle indexPageSkeleton', () => {
    sanitizer.bypassSecurityTrustHtml.mockReturnValue(DivElement.innerHTML);

    expect((window as any).pe_onIndexPageSkeletonLoaded).toBeDefined();
    (window as any).pe_onIndexPageSkeletonLoaded();
    expect(getElementById).toHaveBeenCalledWith('pe-index-page-skeleton-content');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(DivElement.innerHTML);
  });
});

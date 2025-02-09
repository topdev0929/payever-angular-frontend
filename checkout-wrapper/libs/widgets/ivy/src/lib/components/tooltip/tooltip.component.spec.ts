import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponents } from 'ng-mocks';
import '@angular/localize/init';

import { TooltipDialogComponent } from '../dialog/dialog.component';

import { TooltipStyleComponent } from './style/style.component';
import { TooltipComponent } from './tooltip.component';


describe('tooltip', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  let mockOverlay: Overlay;

  const attach = jest.fn(() => ({
    instance: {
      overlayRef: null,
    },
    hostView: {
      markForCheck: jest.fn(),
    },
  }));

  beforeEach(() => {
    mockOverlay = {
      create: jest.fn(() => ({
        attach,
        detach: jest.fn(),
      })),
      position: jest.fn(() => ({
        flexibleConnectedTo: jest.fn(() => ({
          withPositions: jest.fn().mockReturnValue('position'),
        })),
      })),
    } as unknown as Overlay;

    TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [
        TooltipComponent,
        MockComponents(
          TooltipStyleComponent,
          TooltipDialogComponent,
        ),
      ],
      providers: [
        { provide: Overlay, useValue: mockOverlay },
      ],
    }).compileComponents();


    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('tooltip', () => {
    it('should create tooltip overlay with correct configuration', () => {
      component.tooltip();

      expect(mockOverlay.create).toHaveBeenCalledWith({
        positionStrategy: expect.any(String),
        hasBackdrop: true,
        disposeOnNavigation: true,
        height: '530px',
        width: '440px',
        panelClass: 'tooltip-dialog',
        backdropClass: 'ivy-tooltip-backdrop',
        scrollStrategy: expect.any(Object),
      });

      const componentPortal = new ComponentPortal(TooltipDialogComponent);
      expect(attach).toHaveBeenCalledWith(componentPortal);
    });

    it('should call tooltip on container click', async () => {
      jest.spyOn(component, 'tooltip').mockReturnValue(null);
      const container = fixture.debugElement.query(By.css('.container')).nativeElement;
      container.click();

      fixture.whenStable().then(() => {
        expect(component.tooltip).toHaveBeenCalled();
      });
    });
  });
});


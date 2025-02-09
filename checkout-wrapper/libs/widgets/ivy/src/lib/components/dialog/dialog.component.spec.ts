import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import '@angular/localize/init';

import { TooltipDialogComponent } from './dialog.component';

describe('tooltip-dialog', () => {
  let component: TooltipDialogComponent;
  let fixture: ComponentFixture<TooltipDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TooltipDialogComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('translations', () => {
    it('should get translations', () => {
      expect(component.translations).toMatchObject({
        title: $localize`:@@ivy-finexp-widget.tooltip.title:Pay via online banking and plant trees for free`,
        text: {
          title: $localize`:@@ivy-finexp-widget.tooltip.text.title:How does it work?`,
          message: $localize`:@@ivy-finexp-widget.tooltip.text.message:Simply pay directly via online banking at your bank and we will plant a tree for you free of charge.`,
        },
        logo: {
          poweredBy: $localize`:@@ivy-finexp-widget.tooltip.logo.poweredBy:Powered by`,
        },
      });
    });

    it('should render text correctly', () => {
      const mockTranslations = {
        title: 'title',
        text: {
          title: 'text-title',
          message: 'text-message',
        },
        logo: {
          poweredBy: 'text-logo',
        },
      };
      (component as any).translations = mockTranslations;
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('.header span')).nativeElement;
      const textTitle = fixture.debugElement.query(By.css('.title')).nativeElement;
      const message = fixture.debugElement.query(By.css('.message')).nativeElement;
      const logo = fixture.debugElement.query(By.css('.logo span')).nativeElement;

      expect(title.textContent).toContain(mockTranslations.title);
      expect(textTitle.textContent).toContain(mockTranslations.text.title);
      expect(message.textContent).toContain(mockTranslations.text.message);
      expect(logo.textContent).toContain(mockTranslations.logo.poweredBy);
    });
  });

  describe('closeTooltip', () => {
    it('should close tooltip', () => {
      const dispose = jest.fn();
      const remove = jest.fn();
      component.overlayRef = {
        dispose,
        backdropElement: {
          remove,
        },
      } as any;

      component.closeTooltip();

      expect(dispose).toHaveBeenCalled();
      expect(remove).toHaveBeenCalled();
    });
  });

});

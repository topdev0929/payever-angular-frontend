import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvService } from '@pe/common';
import { PeOverlayRef, PE_OVERLAY_DATA } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { PeInfoDialog } from './info.dialog';

describe('PeInfoDialog', () => {

  let fixture: ComponentFixture<PeInfoDialog>;
  let component: PeInfoDialog;
  let peOverlayRef: jasmine.SpyObj<PeOverlayRef>;

  beforeEach(async(() => {

    const peOverlayRefSpy = jasmine.createSpyObj<PeOverlayRef>('PeOverlayRef', ['close']);

    const overlayDataMock = {
      infoText: 'info',
      title: 'title',
    };

    TestBed.configureTestingModule({
      declarations: [PeInfoDialog],
      providers: [
        { provide: PeOverlayRef, useValue: peOverlayRefSpy },
        { provide: EnvService, useValue: null },
        { provide: PE_OVERLAY_DATA, useValue: overlayDataMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeInfoDialog);
      component = fixture.componentInstance;

      peOverlayRef = TestBed.inject(PeOverlayRef) as jasmine.SpyObj<PeOverlayRef>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    const envServiceMock = { businessData: null };

    /**
     * envService is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData is null
     */
    component = new PeInfoDialog(null, envServiceMock as any, {});

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envServiceMock.businessData = { themeSettings: null };

    component = new PeInfoDialog(null, envServiceMock as any, {});

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envServiceMock.businessData.themeSettings = { theme: 'light' };

    component = new PeInfoDialog(null, envServiceMock as any, {});

    expect(component.theme).toEqual('light');

  });

  it('should set props on init', () => {

    component.ngOnInit();

    expect(component.infoText).toEqual('info');
    expect(component.title).toEqual('title');

  });

  it('should handle close', () => {

    component.onClose();

    expect(peOverlayRef.close).toHaveBeenCalled();

  });

});

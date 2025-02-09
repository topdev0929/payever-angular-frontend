import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvService } from '@pe/common';
import { of, Subject } from 'rxjs';
import { PeOverlayRef, PE_OVERLAY_DATA } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { DestroyService } from '../../../misc/services/destroy.service';
import { PeCouponsApi } from '../../../services/abstract.coupons.api';
import { PeDeleteConfirmationDialog } from './delete-confirmation.dialog';

describe('PeDeleteConfirmationDialog', () => {

  let fixture: ComponentFixture<PeDeleteConfirmationDialog>;
  let component: PeDeleteConfirmationDialog;
  let peOverlayRef: jasmine.SpyObj<PeOverlayRef>;
  let api: jasmine.SpyObj<PeCouponsApi>;

  beforeEach(async(() => {

    const peOverlayRefSpy = jasmine.createSpyObj<PeOverlayRef>('PeOverlayRef', ['close']);

    const apiSpy = jasmine.createSpyObj<PeCouponsApi>('PeCouponsApi', ['deleteCouponsFolder']);

    const overlayDataMock = { _id: 'f-001' };

    const destroyMock = new Subject<void>();

    TestBed.configureTestingModule({
      declarations: [PeDeleteConfirmationDialog],
      providers: [
        { provide: PeOverlayRef, useValue: peOverlayRefSpy },
        { provide: PeCouponsApi, useValue: apiSpy },
        { provide: EnvService, useValue: null },
        { provide: PE_OVERLAY_DATA, useValue: overlayDataMock },
        { provide: DestroyService, useValue: destroyMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeDeleteConfirmationDialog);
      component = fixture.componentInstance;

      peOverlayRef = TestBed.inject(PeOverlayRef) as jasmine.SpyObj<PeOverlayRef>;
      api = TestBed.inject(PeCouponsApi) as jasmine.SpyObj<PeCouponsApi>;

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
    component = new PeDeleteConfirmationDialog(null, null, envServiceMock as any, null, null);

    expect(component.theme).toEqual('dark');

    /**
     * evnService.businessData.themeSettings is null
     */
    envServiceMock.businessData = { themeSettings: null };

    component = new PeDeleteConfirmationDialog(null, null, envServiceMock as any, null, null);

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is null
     */
    envServiceMock.businessData.themeSettings = { theme: 'light' };

    component = new PeDeleteConfirmationDialog(null, null, envServiceMock as any, null, null);

    expect(component.theme).toEqual('light');

  });

  it('should set selected folder on init', () => {

    component.ngOnInit();

    expect(component.selectedFolder).toEqual({ _id: 'f-001' } as any);

  });

  it('should handle close', () => {

    component.onClose();

    expect(peOverlayRef.close).toHaveBeenCalled();

  });

  it('should handle save', () => {

    const folder = { _id: 'f-001' };

    api.deleteCouponsFolder.and.returnValue(of(null));

    component.selectedFolder = folder;
    component.onSave();

    expect(api.deleteCouponsFolder).toHaveBeenCalledWith(folder._id);
    expect(peOverlayRef.close).toHaveBeenCalled();

  });

});

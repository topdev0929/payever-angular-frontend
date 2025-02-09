import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { PortalInjector } from '@angular/cdk/portal';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { PeCouponsOverlayService, PeOverlayRef, PE_OVERLAY_DATA } from './coupons-overlay.service';

describe('PeCouponsOverlayService', () => {

  let service: PeCouponsOverlayService;
  let backdropSubject: Subject<void>;
  let overlayRef: any;
  let overlay: jasmine.SpyObj<Overlay>;

  beforeEach(() => {

    backdropSubject = new Subject();
    overlayRef = {
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(backdropSubject),
      attach: jasmine.createSpy('attach'),
    };
    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', {
      create: overlayRef,
      position: {
        global() {
          return {
            centerHorizontally() {
              return {
                centerVertically() {
                  return { test: 'position.strategy' };
                },
              };
            },
          };
        },
      } as any,
    });
    overlaySpy.scrollStrategies = {
      block: jasmine.createSpy('block').and.returnValue({ test: 'scroll.strategy.block' }),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        PeCouponsOverlayService,
        { provide: Overlay, useValue: overlaySpy },
      ],
    });

    service = TestBed.inject(PeCouponsOverlayService);
    overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get overlay config', () => {

    const config = {
      hasBackdrop: true,
      backdropClass: 'backdrop-class',
      panelClass: 'panel-class',
      height: 100,
      width: 200,
    };

    const overlayConfig = service[`getOverlayConfig`](config);

    expect(overlayConfig).toEqual(new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      height: config.height,
      width: config.width,
      scrollStrategy: { test: 'scroll.strategy.block' },
      positionStrategy: { test: 'position.strategy' },
    } as any));
    expect(overlay.position).toHaveBeenCalled();

  });

  it('should create overlay', () => {

    const config = { hasBackdrop: true };
    const getSpy = spyOn<any>(service, 'getOverlayConfig').and.returnValue(config);

    expect(service[`createOverlay`](config)).toEqual(overlayRef);
    expect(getSpy).toHaveBeenCalledWith(config);
    expect(overlay.create).toHaveBeenCalledWith(config);

  });

  it('should create injector', () => {

    const config = { data: { test: 'data' } };

    const injector = service[`createInjector`](config as any, overlayRef);
    expect(injector).toBeInstanceOf(PortalInjector);
    expect(injector.get(PeOverlayRef)).toEqual(overlayRef);
    expect(injector.get(PE_OVERLAY_DATA)).toEqual(config.data);

  });

  it('should open', () => {

    class MockClass { };

    const config = { disableClose: true };
    const createOverlaySpy = spyOn<any>(service, 'createOverlay').and.returnValue(overlayRef);
    const createInjectorSpy = spyOn<any>(service, 'createInjector').and.callThrough();
    const closeSpy = spyOn(PeOverlayRef.prototype, 'close');

    /**
     * config.disableClose is TRUE
     */
    service.open(config, MockClass);

    expect(createOverlaySpy).toHaveBeenCalledWith({
      ...config,
      hasBackdrop: true,
      backdropClass: 'pe-coupons-overlay-backdrop',
      panelClass: 'pe-coupons-overlay-panel',
    });
    expect(overlayRef.attach).toHaveBeenCalled();
    expect(overlayRef.backdropClick).toHaveBeenCalled();
    expect(createInjectorSpy).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    /**
     * test backdrop click
     */
    backdropSubject.next();

    expect(closeSpy).not.toHaveBeenCalled();

    /**
     * config.disableClose is FALSE
     */
    config.disableClose = false;
    backdropSubject.next();

    expect(closeSpy).toHaveBeenCalled();

  });

});

describe('PeOverlayRef', () => {

  const overlayRefMock = {
    dispose: jasmine.createSpy('dispose'),
  };
  const peOverlayRef = new PeOverlayRef(overlayRefMock as any);

  it('should be defined', () => {

    expect(peOverlayRef).toBeDefined();

  });

  it('should close', () => {

    const afterSpies = {
      next: spyOn(peOverlayRef.afterClosed, 'next'),
      complete: spyOn(peOverlayRef.afterClosed, 'complete'),
    };
    const data = { test: 'data' };

    /**
     * argument data is undefined as default
     */
    peOverlayRef.close();

    expect(overlayRefMock.dispose).toHaveBeenCalled();
    expect(afterSpies.next).toHaveBeenCalledWith(undefined);
    expect(afterSpies.complete).toHaveBeenCalled();

    /**
     * argument data is set
     */
    overlayRefMock.dispose.calls.reset();
    afterSpies.next.calls.reset();
    afterSpies.complete.calls.reset();

    peOverlayRef.close(data);

    expect(overlayRefMock.dispose).toHaveBeenCalled();
    expect(afterSpies.next).toHaveBeenCalledWith(data);
    expect(afterSpies.complete).toHaveBeenCalled();

  });

});

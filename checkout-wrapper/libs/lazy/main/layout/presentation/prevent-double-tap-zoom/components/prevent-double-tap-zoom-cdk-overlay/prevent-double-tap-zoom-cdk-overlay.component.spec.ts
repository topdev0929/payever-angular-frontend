import { isDevMode } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  PreventDoubleTapZoomCdkOverlayComponent,
} from './prevent-double-tap-zoom-cdk-overlay.component';

jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  isDevMode: jest.fn(),
}));

describe('PreventDoubleTapZoomCdkOverlayComponent', () => {

  let component: PreventDoubleTapZoomCdkOverlayComponent;
  let fixture: ComponentFixture<PreventDoubleTapZoomCdkOverlayComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        PreventDoubleTapZoomCdkOverlayComponent,
      ],
    });

    fixture = TestBed.createComponent(PreventDoubleTapZoomCdkOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should handleExistingContainers', () => {
      const handleExistingContainers = jest.spyOn(component as any, 'handleExistingContainers');
      component.ngOnInit();
      expect(handleExistingContainers).toHaveBeenCalled();
    });
    it('should call unhandleAllContainers and watchMutations on destroy trigger', () => {
      const unhandleAllContainers = jest.spyOn(component as any, 'unhandleAllContainers');
      const watchMutations = jest.spyOn(component as any, 'watchMutations');
      component.ngOnInit();
      component.destroyed$.next();
      expect(unhandleAllContainers).toHaveBeenCalled();
      expect(watchMutations).toHaveBeenCalled();
    });
    it('should call visitOverlayContainers on domChange$ trigger', () => {
      const visitOverlayContainers = jest.spyOn(component as any, 'visitOverlayContainers');
      component.ngOnInit();
      component.domChange$.next();
      expect(visitOverlayContainers).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should trigger destroyed$', () => {
      const destroyedNext = jest.spyOn(component.destroyed$, 'next');
      const destroyedComplete = jest.spyOn(component.destroyed$, 'complete');
      component.ngOnDestroy();
      expect(destroyedNext).toHaveBeenCalledWith(true);
      expect(destroyedComplete).toHaveBeenCalled();
    });
  });

  describe('handleContainer', () => {
    it('should handleContainer', () => {
      const dataSetKey = 'data-set-key';
      jest.spyOn(component as any, 'convertDataSetProperty')
        .mockReturnValue(dataSetKey);
      const updateHandledContainersArray = jest.spyOn(component as any, 'updateHandledContainersArray')
        .mockReturnValue(null);
      const htmlElement = {
        dataset: {
          dataSetKey: 'test',
        },
      } as unknown as HTMLElement;
      const expectedHandledNode = {
        id: expect.any(String),
        node: htmlElement,
        selector: expect.any(String),
      };
      expect(component['handleContainer'](htmlElement)).toEqual(expectedHandledNode);
      expect(component['handledContainers']).toBeDefined();
      expect(updateHandledContainersArray).toHaveBeenCalled();
    });


  });

  describe('nodeSelector', () => {
    it('should get nodeSelector', () => {
      const datasetAttributeKey = 'handled-cdk-overlay-id';
      expect(component['nodeSelector']('test-id')).toEqual(`[data-${datasetAttributeKey}="test-id"]`);
    });
  });

  describe('convertDataSetProperty', () => {
    it('should convertDataSetProperty perform correctly', () => {
      expect(component['convertDataSetProperty']('test-id')).toEqual('TEST-ID');
    });
  });

  describe('updateHandledContainersArray', () => {
    let handledContainersArrayNext: jest.SpyInstance;
    beforeEach(() => {
      handledContainersArrayNext = jest.spyOn(component.handledContainersArray$, 'next');
    });
    it('should updateHandledContainersArray trigger handledContainersArray$', () => {
      component['updateHandledContainersArray']();
      expect(handledContainersArrayNext).toHaveBeenCalledWith([]);
    });
    it('should updateHandledContainersArray trigger handledContainersArray$ with correct value', () => {
      const nodeInterface = {
        id: 'test-id',
        selector: 'test',
        node: null,
      } as any;
      component.handledContainers.set('test', nodeInterface);
      component['updateHandledContainersArray']();
      expect(handledContainersArrayNext).toHaveBeenCalledWith([nodeInterface]);
    });
  });

  describe('handleExistingContainers', () => {
    it('should handleExistingContainers', () => {
      const handleContainer = jest.spyOn(component as any, 'handleContainer')
        .mockReturnValue(null);
      const htmlElement = {
        dataset: {
          dataSetKey: 'test',
        },
      };
      jest.spyOn(document, 'querySelectorAll').mockReturnValue([htmlElement] as any);
      component['handleExistingContainers']();
      expect(handleContainer).toHaveBeenCalledWith(htmlElement);
    });
  });

  describe('watchMutations', () => {
    it('should watchMutations perform correctly', () => {
      const body = document.querySelector('body');
      const querySelector = jest.spyOn(document, 'querySelector')
        .mockReturnValue(body);
      (isDevMode as jest.Mock).mockReturnValue(false);
      component['watchMutations']();
      expect(querySelector).toHaveBeenCalled();
    });

    it('should watchMutations perform correctly if isdev true', () => {
      jest.spyOn(console, 'warn').mockReturnValue(null);
      const querySelector = jest.spyOn(document, 'querySelector')
        .mockReturnValue(null);
      (isDevMode as jest.Mock).mockReturnValue(true);
      component['watchMutations']();
      expect(querySelector).toHaveBeenCalled();
    });
  });

  describe('visitOverlayContainers', () => {
    let querySelectorAll: jest.SpyInstance;
    let handleContainerSpy: jest.SpyInstance;
    let unhandleContainerSpy: jest.SpyInstance;

    beforeEach(() => {
      querySelectorAll = jest.spyOn(document, 'querySelectorAll');
      handleContainerSpy = jest.spyOn(component as any, 'handleContainer');
      unhandleContainerSpy = jest.spyOn(component as any, 'unhandleContainer')
        .mockReturnValue(null);
    });

    it('should handle container if no dataset property is present', () => {
      const found = [
        {
          dataset: {
            [component['datasetPropertyKey']]: 'visited-id',
          },
        },
        {
          dataset: {
            'no-id': 'test',
          },
        },
      ];
      querySelectorAll.mockReturnValue(found);

      component['visitOverlayContainers']();

      expect(handleContainerSpy).toHaveBeenCalledWith(found[1]);
    });


    it('should auto-unhandle containers that are not visited', () => {
      const found = [
        {
          dataset: {
            [component['datasetPropertyKey']]: 'visited-id',
          },
        },
        {
          dataset: {
            [component['datasetPropertyKey']]: 'not-visited-id',
          },
        },
      ];
      const notVisitedId = found[1].dataset[component['datasetPropertyKey']];
      const notVisitedHandledNode: any = {
        id: notVisitedId, selector: null, node: null,
      };
      component['handledContainers'].set(notVisitedId, notVisitedHandledNode);

      component['visitOverlayContainers']();

      expect(unhandleContainerSpy).toHaveBeenCalledWith(notVisitedHandledNode);
    });
  });

});

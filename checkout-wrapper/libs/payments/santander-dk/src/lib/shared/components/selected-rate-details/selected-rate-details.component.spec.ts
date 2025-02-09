import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as csseq from 'css-element-queries';
import '@angular/localize/init';

import { UISelectedRateDetailsComponent } from './selected-rate-details.component';

jest.mock('css-element-queries', () => ({
  ResizeSensor: jest.fn(),
}));

describe('UISelectedRateDetailsComponent', () => {

  let fixture: ComponentFixture<UISelectedRateDetailsComponent>;
  let component: UISelectedRateDetailsComponent;

  let elementRefMock: any;
  let resizeSensorMock: {
    element: Element | Element[];
    callback: csseq.ResizeSensorCallback;
    detach: jest.Mock,
  };

  beforeEach(() => {

    elementRefMock = {
      nativeElement: { clientWidth: 100 },
    };

    resizeSensorMock = {
      element: null as Element | Element[],
      callback: null as csseq.ResizeSensorCallback,
      detach: jest.fn(),
    };

    jest.spyOn(csseq, 'ResizeSensor')
      .mockImplementation((el: Element | Element[], callbackFn: csseq.ResizeSensorCallback) => {
        resizeSensorMock.element = el;
        resizeSensorMock.callback = callbackFn;

        return resizeSensorMock as any;
      });

    TestBed.configureTestingModule({
      declarations: [UISelectedRateDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UISelectedRateDetailsComponent);
    component = fixture.componentInstance;

    component['element'] = elementRefMock;

    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should handle ng after view init', () => {

    const resizedSpy = jest.spyOn(component, 'onResized');

    component.ngAfterViewInit();

    expect(component['resizeSensor']).toEqual(resizeSensorMock);
    expect(resizedSpy).not.toHaveBeenCalled();
    expect(resizeSensorMock.element).toEqual(elementRefMock.nativeElement);
    expect(resizeSensorMock.callback).toBeDefined();

    resizeSensorMock.callback(null);
    expect(resizedSpy).toHaveBeenCalledWith(100);

  });

  it('should handle ng destroy', () => {

    /**
     * component.resizeSensor is set
     */
    component['resizeSensor'] = resizeSensorMock as any;
    component.ngOnDestroy();

    /**
     * component.resizeSensor is null
     */
    component['resizeSensor'] = null;
    component.ngOnDestroy();

    /**
     * component.resizeSensor is set
     */
    component['resizeSensor'] = resizeSensorMock as any;
    component.ngOnDestroy();

    expect(resizeSensorMock.detach).toHaveBeenCalledTimes(2);

  });

  it('should handle ng changes', () => {

    component.details = [
      { title: 'Detail 1', value: 'detail-1' },
      { title: 'Detail 2', value: 'detail-2' },
      { title: 'Detail 3', value: 'detail-3' },
      { title: 'Detail 4', value: 'detail-4' },
    ];
    component.rows = null;
    component.ngOnChanges();

    expect(component.rows).toEqual([
      [
        { title: 'Detail 1', value: 'detail-1' },
        { title: 'Detail 2', value: 'detail-2' },
      ],
      [
        { title: 'Detail 3', value: 'detail-3' },
        { title: 'Detail 4', value: 'detail-4' },
      ],
    ]);

  });

  it('should handle resized', () => {

    const changesSpy = jest.spyOn(component, 'ngOnChanges');
    const detectSpy = jest.spyOn(component['cdr'], 'detectChanges');

    component['oldWidth'] = 1000;
    component.numColumns = 3;

    /**
     * argument width is equal to component.oldWidth
     */
    component.onResized(1000);

    expect(component['oldWidth']).toBe(1000);
    expect(component.isSmallSize).toBe(false);
    expect(component.isExtraSmallSize).toBe(false);
    expect(component.numColumns).toBe(3);
    expect(changesSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * argument width is 1200
     */
    component.onResized(1200);

    expect(component['oldWidth']).toBe(1200);
    expect(component.isSmallSize).toBe(false);
    expect(component.isExtraSmallSize).toBe(false);
    expect(component.numColumns).toBe(3);
    expect(changesSpy).toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();

    /**
     * argument width is 500
     */
    component.onResized(500);

    expect(component['oldWidth']).toBe(500);
    expect(component.isSmallSize).toBe(true);
    expect(component.isExtraSmallSize).toBe(false);
    expect(component.numColumns).toBe(2);

    /**
     * argument width is 320
     */
    component.onResized(320);

    expect(component['oldWidth']).toBe(320);
    expect(component.isSmallSize).toBe(true);
    expect(component.isExtraSmallSize).toBe(true);
    expect(component.numColumns).toBe(1);

  });

});

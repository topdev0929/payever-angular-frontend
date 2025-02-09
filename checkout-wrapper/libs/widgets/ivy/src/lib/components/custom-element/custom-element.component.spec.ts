import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponents } from 'ng-mocks';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';
import {
  flowFixture,
  QueryChildByDirective,
} from '@pe/checkout/testing';
import { WidgetTypeEnum } from '@pe/checkout/types';

import { widgetConfigFixture } from '../../test';
import { IvyWidgetComponent } from '../ivy-widget';

import { IvyCustomElementComponent } from './custom-element.component';

describe('widget-ivy', () => {
  let component: IvyCustomElementComponent;
  let fixture: ComponentFixture<IvyCustomElementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockComponents(
          IvyWidgetComponent,
        ),
        IvyCustomElementComponent,
      ],
    });
    fixture = TestBed.createComponent(IvyCustomElementComponent);
    component = fixture.componentInstance;
  });

  const initComponent = () => {
    fixture.componentRef.setInput('config', widgetConfigFixture());
    fixture.componentRef.setInput('amount', flowFixture().amount);
    fixture.componentRef.setInput('channelset', flowFixture().channelSetId);
    fixture.componentRef.setInput('cart', widgetConfigFixture().cart);
    fixture.componentRef.setInput('isdebugmode', widgetConfigFixture().isDebugMode);
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      initComponent();
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should ivy-widget I/O perform correctly', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      initComponent();
      const { child: ivyWidget } = QueryChildByDirective(fixture, IvyWidgetComponent);
      expect(ivyWidget.amount).toEqual(component.amount);
      expect(ivyWidget.channelSet).toEqual(component.channelSet);
      expect(ivyWidget.config).toMatchObject(component.config);
      expect(ivyWidget.cart).toEqual(component.cart);
      expect(ivyWidget.isDebugMode).toEqual(component.isDebugMode);

      const clicked = jest.spyOn(component.clicked, 'emit');
      ivyWidget.clickedEmitter.emit();
      expect(clicked).toBeCalled();

      const onFailed = jest.spyOn(BaseWidgetCustomElementComponent.prototype, 'onFailed');
      ivyWidget.failedEmitter.emit();
      expect(onFailed).toBeCalled();
    });

    it('should hide ivy-widget if type is not button', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.directive(IvyWidgetComponent))).toBeTruthy();

      fixture.componentRef.setInput('type', WidgetTypeEnum.Text);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.directive(IvyWidgetComponent))).toBeNull();
    });
  });
});

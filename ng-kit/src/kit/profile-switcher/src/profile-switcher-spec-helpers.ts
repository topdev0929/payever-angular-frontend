import {PeProfileCardConfigInterface, PeProfileCardInterface, ProfileCardType, ProfileControlType} from './interfaces';
import {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';

export function click(debugElement: DebugElement) {
  debugElement.triggerEventHandler('click', new MouseEvent(''));
};

export function profileCard(attributes: object = {}): PeProfileCardInterface {
  return {...{
      name: 'name',
      uuid: 'uuid',
      logo: 'logo.jpg',
      leftControl: {
        type: ProfileControlType.Button,
      },
      rightControl: {
        type: ProfileControlType.Menu,
      },
    }, ...attributes,};
};

export function profileCardConfig(attributes: object = {}): PeProfileCardConfigInterface {
  return {
    ...{
      cardTitle: 'card-title',
      type: ProfileCardType.Business,
      cardButtonText: 'button',
      images: ['img1.jpg', 'img2.jpg'],
      placeholderTitle: 'placeholder',
      onCardButtonClick: () => true,
    }, ...attributes,
  };
};

export function getComponent<T>(fixture: ComponentFixture<any>, component: any): T {
  const debugElement = fixture.debugElement.query(By.directive(<any>component));
  return debugElement.componentInstance;
}

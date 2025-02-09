import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import {
  imageUrlBase64Fixture,
  nonRecompilableTestModuleHelper,
} from '@pe/ng-kit/modules/test';

import { ImageComponent } from './';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [ImageComponent]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('provide image url for component', () => {
    const src: string = imageUrlBase64Fixture();
    component.image = src;
    fixture.detectChanges();
    const image: DebugElement = fixture.debugElement.query(By.css('img'));
    expect(image).toBeTruthy();
    expect((image.nativeElement as HTMLImageElement).src).toBe(src); // <--- success!
  });
});

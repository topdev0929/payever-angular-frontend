import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { LocationTestMoudle } from '@pe/ng-kit/modules/location/testing';
import { LocationService, LocationStubService } from '@pe/ng-kit/modules/location';

@Component({})
class TetsComponent {

  constructor(
    private location: LocationService,
  ) {}

  reloadApp(): void {
    this.location.reload();
  }

  openUrl(url: string): void {
    this.location.href = url;
  }

}

describe('LocationService In Tests', () => {
  let location: LocationStubService;
  let component: TetsComponent;

  beforeEach(async () => {
    await TestBed
      .configureTestingModule({
        declarations: [TetsComponent],
        imports: [LocationTestMoudle] // <-- provides mocking
      })
      .compileComponents();

    component = TestBed.createComponent(TetsComponent).componentInstance;
    location = TestBed.get(LocationService); // <-- inject here for assertions
  });

  it('shoud reload app', () => {
    expect(location.reloaded).toBe(false, 'Page was not reloaded before');
    // |--- Karma test page didn't reloaded here!
    // V
    component.reloadApp();
    expect(location.reloaded).toBe(true, 'Page was reloaded after reloadApp() call');
  });

  it('should open url in browser', () => {
    const testUrl: string = 'http://example.com/';
    expect(location.href).not.toBe(testUrl, 'Should be original karma test page url');
    component.openUrl(testUrl);
    expect(location.href).toBe(testUrl, 'Compnent opened new page in browser');
  });
});

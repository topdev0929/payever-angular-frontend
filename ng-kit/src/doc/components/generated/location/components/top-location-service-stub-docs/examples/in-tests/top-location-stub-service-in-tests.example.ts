import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { LocationTestMoudle } from '@pe/ng-kit/modules/location/testing';
import { TopLocationService, TopLocationStubService } from '@pe/ng-kit/modules/location';

@Component({})
class TetsComponent {
  constructor(
    private topLocation: TopLocationService,
  ) {}

  openUrlInTop(url: string): void {
    this.topLocation.href = url;
  }
}

describe('TopLocationStubService In Tests', () => {
  let topLocation: TopLocationStubService;
  let component: TetsComponent;

  beforeEach(async () => {
    await TestBed
      .configureTestingModule({
        declarations: [TetsComponent],
        imports: [LocationTestMoudle] // <-- provides mocking
      })
      .compileComponents();

    component = TestBed.createComponent(TetsComponent).componentInstance;
    topLocation = TestBed.get(TopLocationService); // <-- inject here for assertions
  });

  it('should open url in browser', () => {
    const testUrl: string = 'http://example.com/2';
    component.openUrlInTop(testUrl);
    expect(topLocation.href).toBe(testUrl, 'Component opened new top page in browser');
  });
});

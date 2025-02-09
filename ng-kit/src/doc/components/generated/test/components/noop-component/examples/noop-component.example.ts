import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoopComponent } from '@pe/ng-kit/modules/test';

import { AwesomeService } from './';

describe('non-directly renering component test', () => {
  let noopFixture: ComponentFixture<NoopComponent>;
  let service: AwesomeService;

  beforeEach(async () => {
    TestBed
      .configureTestingModule({
        providers: [ AwesomeService ],
        declarations: [ NoopComponent ],
      });
    await TestBed.compileComponents();
    noopFixture = TestBed.createComponent(NoopComponent);
    service = TestBed.get(AwesomeService);
  });

  describe('some section...', () => {
    it('should perform some test', async () => {
      service.updateDOM(); // <--- some DOM manipulation here

      noopFixture.detectChanges(); // <--- because we do not have fixture of entire component
      await noopFixture.whenStable(); // <--- use if need some stable state

      expect(document.querySelector('.rendred-element')).toBeTruthy(); // <--- success, but without other components
    });
  });
});

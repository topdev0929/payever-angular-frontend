import { TestBed } from '@angular/core/testing';

import { fakeOverlayContainer, FakeOverlayContainer } from '@pe/ng-kit/modules/test';

describe('Component uses OverlayContainer', () => {
  const {
    overlayContainerElement,
    fakeElementContainerProvider
  }: FakeOverlayContainer = fakeOverlayContainer();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      // your other stuff using container here
      providers: [fakeElementContainerProvider],
    });
    await TestBed.compileComponents();
    // other stuff like your component/service creation/injection here or whatever you need
  });

  it('should create overlayContainerElement', () => {
    expect(overlayContainerElement).toBeTruthy();
    expect(overlayContainerElement instanceof HTMLDivElement).toBe(true);
  });

  it('should find rendering results inside overlay container (only)', () => {
    // don't forget to perform detect changes here!

    //   |--- Qurying in container here!
    //   V
    const renderedTestButton: HTMLButtonElement = overlayContainerElement.querySelector('button.test-button');
    expect(renderedTestButton).not.toBeNull('Should render test button with preset class');
    expect(renderedTestButton.innerHTML).toContain('translateScope.ok');
  });
});

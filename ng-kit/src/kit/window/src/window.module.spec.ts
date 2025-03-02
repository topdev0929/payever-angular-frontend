import { TestBed } from '@angular/core/testing';

import { WindowModule } from './window.module';
import { WindowService } from './services';

describe('WindowModule', () => {
  it('should export all content', () => {
    TestBed.configureTestingModule({
      imports: [WindowModule]
    });

    const windowService: WindowSessionStorage = TestBed.get(WindowService);
    expect(windowService).toBeTruthy();
    expect(windowService instanceof WindowService).toBe(true);
  });
});

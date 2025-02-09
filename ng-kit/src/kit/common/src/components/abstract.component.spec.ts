import { Component } from '@angular/core';
import { AbstractComponent } from './abstract.component';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

describe('AbstractComponent', () => {

  @Component({
    selector: 'test-comp'
  })
  class TestComp extends AbstractComponent {
    subject: Subject<any> = new Subject();
    sub: Subscription = this.subject.pipe(takeUntil(this.destroyed$)).subscribe(() => this.count++);
    count = 0;
  }

  it('should take until destroy', () => {
    const comp = new TestComp();
    comp.subject.next(1);
    comp.subject.next(2);

    comp.ngOnDestroy();

    comp.subject.next(3);

    expect(comp.count).toBe(2);
  });
});

import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractService } from './abstract.service';

describe('AbstractService', () => {

  class TestService extends AbstractService {
    subject: Subject<any> = new Subject();
    sub: Subscription = this.subject.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.count++);
    count = 0;
  }

  it('should take until destroy', () => {
    const service = new TestService();
    service.subject.next(1);
    service.subject.next(2);

    service.ngOnDestroy();

    service.subject.next(3);

    expect(service.count).toBe(2);
  });
});

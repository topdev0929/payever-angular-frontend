import { TestBed } from '@angular/core/testing';

import { LayoutService } from './layout.service';

describe('LayoutService', () => {

  let service: LayoutService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        LayoutService,
      ],
    });

    service = TestBed.inject(LayoutService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should toggle show order without value', (done) => {
    service.toggleShowOrder();
    service.showOrder$.subscribe((show) => {
      expect(service['showOrderSubject$'].value).toBeTruthy();
      expect(show).toBeTruthy();
      done();
    });
  });

  it('should toggle show order false without value', (done) => {
    service['showOrderSubject$'].next(true);
    service.toggleShowOrder();
    service.showOrder$.subscribe((show) => {
      expect(service['showOrderSubject$'].value).toBeFalsy();
      expect(show).toBeFalsy();
      done();
    });
  });

  it('should toggle show order', (done) => {
    service.toggleShowOrder(true);
    service.showOrder$.subscribe((show) => {
      expect(show).toBeTruthy();
      done();
    });
  });

});

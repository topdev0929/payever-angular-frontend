import { DestroyService } from './destroy.service';

describe('DestroyService', () => {

  const service = new DestroyService();

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should handle ng destroy', () => {

    const spies = [
      spyOn(service, 'next'),
      spyOn(service, 'complete'),
    ];

    service.ngOnDestroy();

    spies.forEach(spy => expect(spy).toHaveBeenCalled());

  });

});

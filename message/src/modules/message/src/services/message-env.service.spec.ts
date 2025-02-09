import { PeMessageEnvService } from './message-env.service';

describe('PeMessageEnvService', () => {

  const service = new PeMessageEnvService();

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set/get businessId', () => {

    const nextSpy = spyOn(service[`businessIdStream$`], 'next').and.callThrough();

    service.businessId = 'b-001';

    expect(nextSpy).toHaveBeenCalledWith('b-001');
    expect(service.businessId).toEqual('b-001');
    service.businessId$.subscribe(id => expect(id).toEqual('b-001'));

  });

});

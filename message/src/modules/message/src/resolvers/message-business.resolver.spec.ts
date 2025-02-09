import { PeMessageBusinessResolver } from './message-business.resolver';

describe('PeMessageBusinessResolver', () => {

  const peMessageEnvService = { businessId: null };
  const resolver = new PeMessageBusinessResolver(peMessageEnvService as any);

  it('should be defined', () => {

    expect(resolver).toBeDefined();

  });

  it('should resolve', () => {

    const stateMock = {
      url: '',
    };

    /**
     * state.url is '' (empty string)
     */
    resolver.resolve(null as any, stateMock as any);

    expect(peMessageEnvService.businessId).toBeUndefined();

    /**
     * state.url is set
     */
    stateMock.url = 'business/b-001/test';

    resolver.resolve(null as any, stateMock as any);

    expect(peMessageEnvService.businessId).toEqual('b-001' as any);

  });

});

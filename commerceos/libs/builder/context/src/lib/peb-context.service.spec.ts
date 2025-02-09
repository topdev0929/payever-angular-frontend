import { PebContextService } from './peb-context.service';

describe('Context Service', () => {
  it('resolve context for root element', () => {
    const contextService = new PebContextService();

    expect(contextService).toBeDefined();
  });
});

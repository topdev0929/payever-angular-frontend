import { getAppUrl } from './checkout.helpers';

const mockWindowLocation = (url: string) => {
  Object.defineProperty(window, 'location', {
    value: {
      ancestorOrigins: ['https://example.com'],
      origin: 'https://example.com',
      pathname: url,
    },
    writable: true,
  });
};

describe('getAppUrl', () => {
  it('should return the correct app URL without a product UUID in the path', () => {
    mockWindowLocation('/some/path/without/uuid');
    expect(getAppUrl()).toEqual('https://example.com/some/path/without/uuid');
  });

  it('should remove the product UUID from the path and return the correct app URL', () => {
    mockWindowLocation('/some/path/product/123e4567-e89b-12d3-a456-426655440000');
    expect(getAppUrl()).toEqual('https://example.com/some/path');
  });

  it('should remove "cart" from the path and return the correct app URL', () => {
    mockWindowLocation('/some/path/cart');
    expect(getAppUrl()).toEqual('https://example.com/some/path');
  });
});

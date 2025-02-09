export const locationMock = (location: Partial<Location> = {}) => {
    const windowSpy = jest.spyOn(window, 'location', 'get');

    windowSpy.mockImplementation(() => ({
        href: '',
        hash: '',
        host: '',
        hostname: '',
        origin: '',
        pathname: '',
        port: '',
        protocol: '',
        search: '',
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn(),
        ...location,
    } as any));

    return windowSpy;
};

import { PeMessageThemeService } from './message-theme.service';

describe('PeMessageThemeService', () => {

  const service = new PeMessageThemeService();

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set theme', () => {

    const hexToRGBArrSpy = spyOn(service, 'hexToRGBArr').and.callThrough();

    /**
     * argument color is #333333 = rgb(51, 51, 51)
     */
    expect(service.setTheme('#333333')).toEqual('dark');
    expect(hexToRGBArrSpy).toHaveBeenCalledWith('#333333');

    /**
     * argument color is #E7E7E7 = rgb(231, 231, 231)
     */
    expect(service.setTheme('#E7E7E7')).toEqual('light');
    expect(hexToRGBArrSpy).toHaveBeenCalledWith('#E7E7E7');

  });

  it('should convert hex to rgb array', () => {

    const color = '#333333';
    const rgbArray = [51, 51, 51];

    expect(service.hexToRGBArr(color)).toEqual(rgbArray);

  });

  it('should set lighten', () => {

    const hexToRGBArrSpy = spyOn(service, 'hexToRGBArr').and.callThrough();
    const color = '#333333';

    /**
     * color is #333333
     * lighten amount is 10
     * expected #3d3d3d
     */
    expect(service.adjustBrightness(color, 10)).toEqual('#3d3d3d');

    /**
     * lighten amount is 250
     * expected #ffffff
     */
    expect(service.adjustBrightness(color, 250)).toEqual('#ffffff');

    /**
     * lighten amount is -100
     * expected #000000
     */
    expect(service.adjustBrightness(color, -100)).toEqual('#0');
    expect(hexToRGBArrSpy).toHaveBeenCalledTimes(3);
    expect(hexToRGBArrSpy).toHaveBeenCalledWith(color);

  });

});

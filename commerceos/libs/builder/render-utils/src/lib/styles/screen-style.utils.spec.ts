import { PebTextJustify, PebTextStyle, PEB_ELEMENT_BASE_STYLE } from '@pe/builder/core';
import { getCascadeStylesByWidth, getScreenBySize } from '.';

describe('Styles Util', () => {
  it('should get the first available screen if key not presented', () => {
    const styles: any = {
      'desktop': {
        color: 'desktop-color',
        border: 'desktop-border',
        margin: 'desktop-margin',
        isDesktop: true,
      },
      'tablet': {
        color: 'tablet-color',
        border: 'tablet-color',
        isTablet: true,
      },
      'mobile': {
        left: 99,
        isMobile: true,
      }
    };

    const screens = [
      {
        key: 'desktop',
        title: 'Desktop',
        width: 1200,
        padding: 88,
        icon: 'desktop',
      },
      {
        key: 'tablet',
        title: 'Tablet',
        width: 768,
        padding: 0,
        icon: 'tablet',
      },
      {
        key: 'mobile',
        title: 'Mobile',
        width: 360,
        padding: 0,
        icon: 'mobile',
      },
    ];
    const rootKey = 'desktop';

    const wideStyles = getCascadeStylesByWidth(styles, screens, 2000, rootKey);
    expect(wideStyles).toEqual({ ...PEB_ELEMENT_BASE_STYLE, ...styles.desktop });

    const tabletStyles = getCascadeStylesByWidth(styles, screens, 768, rootKey);
    expect(tabletStyles).toEqual({ ...PEB_ELEMENT_BASE_STYLE, ...styles.desktop, ...styles.tablet });

    const mobileStyles = getCascadeStylesByWidth(styles, screens, 768 - 1, rootKey);
    expect(mobileStyles).toEqual({ ...PEB_ELEMENT_BASE_STYLE, ...styles.desktop, ...styles.tablet, ...styles.mobile });
  });

  it('should return cascade styles for text styles', () => {

    const desktopTextStyles: Partial<PebTextStyle> = {
      color: { r: 1, g: 1, b: 1, a: 1 },
      fontFamily: 'font-family',
      italic: true,
      letterSpacing: 20,
    }

    const tabletTextStyles: Partial<PebTextStyle> = {
      letterSpacing: 'auto',
      textJustify: PebTextJustify.Center,
      underline: true,
    }

    const styles = {
      desktop: {
        textStyles: desktopTextStyles,
      },
      tablet: {
        textStyles: tabletTextStyles,
      },
      mobile: {
      },
    } as any;

    const screens = [
      { key: 'desktop', width: 1200 },
      { key: 'tablet', width: 768 },
    ] as any;
    const rootKey = 'desktop';

    const tabletStyles = getCascadeStylesByWidth(styles, screens, 768, rootKey);
    expect(tabletStyles).toEqual({
      ...PEB_ELEMENT_BASE_STYLE,
      textStyles: { ...desktopTextStyles, ...tabletTextStyles }
    });

  });

  it('should find screen by size', () => {
    const orderedScreens = [
      {
        key: 'desktop',
        title: 'Desktop',
        width: 1200,
        padding: 88,
        icon: 'desktop',
      },
      {
        key: 'tablet',
        title: 'Tablet',
        width: 768,
        padding: 0,
        icon: 'tablet',
      },
      {
        key: 'mobile',
        title: 'Mobile',
        width: 360,
        padding: 0,
        icon: 'mobile',
      },
    ];

    expect(getScreenBySize(orderedScreens, 1600).key).toEqual('desktop');
    expect(getScreenBySize(orderedScreens, 1500).key).toEqual('desktop');
    expect(getScreenBySize(orderedScreens, 1201).key).toEqual('desktop');
    expect(getScreenBySize(orderedScreens, 1199).key).toEqual('tablet');
    expect(getScreenBySize(orderedScreens, 770).key).toEqual('tablet');
    expect(getScreenBySize(orderedScreens, 768).key).toEqual('tablet');
    expect(getScreenBySize(orderedScreens, 750).key).toEqual('mobile');
    expect(getScreenBySize(orderedScreens, 360).key).toEqual('mobile');
    expect(getScreenBySize(orderedScreens, 320).key).toEqual('mobile');
  });
})

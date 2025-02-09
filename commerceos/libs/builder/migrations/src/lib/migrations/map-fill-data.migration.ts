import { PebMigration } from '../migrations.interface';

export const mapFillData: PebMigration = async (elm: any) => {

  for (let key of ['desktop', 'mobile', 'tablet']) {
    const styles = elm.styles[key];
    const data = elm.data;

    const fill = extractVideoFill(styles, data)
    || extractImageFill(styles, data)
    || extractGradientFill(styles, data)
    || extractSolidFill(styles);

    if (fill) {
      styles.fill = fill;
    }
  }

  return elm;
};

const extractVideoFill =(styles: any, data: any)=> {
  if (styles.mediaType !== 'video') {
    return null;
  }

  const videoObjectFit = data?.videoObjectFit?.value;
  let fillMode;
  if (videoObjectFit === 'none') {
    fillMode = 'original';
  } else if(videoObjectFit === 'contain') {
    fillMode = 'fit';
  } else if(videoObjectFit === 'cover') {
    fillMode = 'fill';
  } else if(videoObjectFit === 'fill') {
    fillMode = 'stretch';
  } else {
    fillMode = 'original';
  }

  return {
    type: 'video',
    scale: Number(data?.videoScale || 100),
    url: data?.source,
    fillMode,
    mimeType: 'video',
    fillColor: parsePebColor(styles.backgroundColor),
    width: styles.width ,
    height: styles.height,

    sound: data?.sound,
    controls: data?.controls,
    autoplay: data?.autoplay,
    loop: data?.loop,
    preview: data?.preview,
    thumbnail: data?.thumbnail,
  };
};

const extractImageFill =(styles:any, data: any)=> {
  if (styles.mediaType !== 'image') {
    return null;
  }

  const { fillMode, scale } = getFillInfo(styles);
  const res =  {
    type: 'image',
    scale,
    url: styles.backgroundImage,
    mimeType: styles.backgroundImageMimeType,
    fillMode,
    fillColor: parsePebColor(styles.backgroundColor),
    width: styles.backgroundImageWidth,
    height: styles.backgroundImageHeight,
  };

  return res;
};

const getFillInfo = (styles: any): { fillMode: string, scale: number } => {
  let scale = 100;
  let fillMode = 'original';

  if (styles.backgroundSize === '100% 100%') {
    fillMode = 'stretch';
  }
  else if (styles.backgroundSize?.includes('%')) {
    scale = parseInt(styles.backgroundSize?.replace('%', ''));
    fillMode = styles.backgroundRepeat === 'repeat'?'tile':'original';
  }
  else if (styles.backgroundSize === 'cover') {
    fillMode = 'fill';
  }
  else if (styles.backgroundSize === 'contain') {
    fillMode = 'fit';
  }

  return { fillMode, scale };
};

const extractGradientFill = (styles: any, data: any) => {
  let backgroundImage = styles?.backgroundImage;
  if (!backgroundImage?.includes('linear-gradient')) {
    return null;
  }

  backgroundImage = backgroundImage?.replace('white', '#ffffff');
  const re = /\d+\.?\d?deg,\s?|#[a-fA-F0-9]{3,8}\s\d+%|rgba?\(\d+\.?\d*,\s?\d+\.?\d*,\s?\d+\.?\d*,?\s?\d?\.?\d*\)\s\d+\.?\d*%/g;
  const matches = backgroundImage.match(re);
  if (matches) {
    const angle = parseFloat(matches.shift());
    const colorStops = matches.map((step: any) => {
      const [colorStr, offsetStr] = step.split(' ');

      return { color: parsePebColor(colorStr), offset: parseFloat(offsetStr) };
    });

    return {
      type: 'gradient',
      gradientType: 'linear',
      angle,
      colorStops: [colorStops[0], colorStops[1]],
    };
  }

  return null;
};

const extractSolidFill = (styles: any) => {
  if (styles.backgroundColor) {
    const fill = {
      type: 'solid',
      color: parsePebColor(styles.backgroundColor),
    };

    return fill;
  }

  return null;
};

const parsePebColor = (val: string) => {
  if (!val) {
    return null;
  }

  if (val === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return parseRgba(val) || hexToRgba(val);
};

const parseRgba = (value: string) => {
  let m = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(value);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3] };
  }

  m = /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+\.?\d*|\.\d+)\s*\)$/i.exec(value);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3], a: +m[4] };
  }

  return null;
};



const hexToRgba = (hex: string) => {
  if (!hex) {
    return null;
  }
  hex = hex.toLowerCase();
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = parseInt(hex.slice(7, 9), 16)/255;

  return isNaN(a) ? { r, g, b } : { r, g, b, a };
};

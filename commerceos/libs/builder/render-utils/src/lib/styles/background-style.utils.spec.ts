import { getBackgroundCssStyles, getPreviewBackgroundStyle } from '.';
import { PebFillMode, PebFillType, PebImageFill, PebVideoFill } from '@pe/builder/core';


const transparent = { backgroundColor: 'transparent' };
const sampleVideoFill: PebVideoFill = {
  type: PebFillType.Video,
  fillMode: PebFillMode.Fill,
  url: 'http://test/sample.avi',
  preview: 'http://test/preview.jpg',
  thumbnail: '',
  fillColor: null,
  mimeType: 'video',
  width: 100,
  height: 150,
  autoplay: true,
  loop: true,
  controls: true,
  sound: true,
};

const sampleSVG: PebImageFill = {
  type: PebFillType.Image,
  fillMode: PebFillMode.Fill,
  url: 'http://test/sample.svg',
  fillColor: null,
  mimeType: 'image/svg+xml',
  width: 100,
  height: 150,
};

describe('background styles',()=>{

  it('should return transparent style for Video',()=>{    
    const styles = getBackgroundCssStyles(sampleVideoFill);
    expect(styles.backgroundColor).toEqual('transparent');
    expect(styles.objectFit).toBeUndefined();
    expect(styles.objectPosition).toBeUndefined();
    expect(styles.backgroundImage).toBeUndefined();
  });

  it('should return transparent style for SVG',()=>{    
    const styles = getBackgroundCssStyles(sampleSVG);
    expect(styles.backgroundColor).toEqual('transparent');
    expect(styles.objectFit).toBeUndefined();
    expect(styles.objectPosition).toBeUndefined();
    expect(styles.backgroundImage).toBeUndefined();
  });

  it('should return style for preview Video',()=>{    
    const styles = getPreviewBackgroundStyle(sampleVideoFill);
    expect(styles.backgroundColor).toEqual('transparent');
    expect(styles.backgroundImage).toEqual(`url(${sampleVideoFill.preview})`);
  });

  it('should return style for preview SVG',()=>{    
    const styles = getPreviewBackgroundStyle(sampleSVG);
    expect(styles.backgroundColor).toEqual('transparent');
    expect(styles.backgroundImage).toEqual(`url(${sampleSVG.url})`);
  });

})

import { Injectable } from '@angular/core';

@Injectable()
export class SwiperService {

  getSwiperConfig(windowWidth: number): SwiperOptions {
    return  {
      slidesPerView: 'auto',
      freeMode: true,
      shortSwipes: false,
      longSwipesRatio: 0.1,
      longSwipesMs: 100,
      width: windowWidth
    };
  }
}

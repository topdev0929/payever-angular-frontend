import { StoreSliderActionInterface } from '../..';

export const UI_STORE_SLIDER_PRESETS: StoreSliderActionInterface[]  = [
  {
    name: 'store-slider-buttons',
    title: 'Show slide buttons',
    isActive: true,
    extraTitle: null
  },
  {
    name: 'store-slider-rotate',
    title: 'Autorotate',
    isActive: true,
    extraTitle: '5 seg'
  },
  {
    name: 'store-slider-arrows',
    title: 'Show navigation arrows',
    isActive: true,
    extraTitle: null
  }
];

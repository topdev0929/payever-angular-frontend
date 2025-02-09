export const defaultImageSliderOptions: SwiperOptions = {
  autoplay: {
    delay: 5000,
    disableOnInteraction: true
  },
  centeredSlides: true,
  navigation: {
    nextEl: '.button-next',
    prevEl: '.button-prev'
  },
  pagination: {
    el:'.swiper-pagination',
    clickable: true
  },
  spaceBetween: 0
};

export const defaultThumbsOptions: SwiperOptions = {
  centeredSlides: true,
  freeMode: true,
  slidesPerView: 'auto',
  slideToClickedSlide: true,
  spaceBetween: 10,
  touchRatio: 0.2
};

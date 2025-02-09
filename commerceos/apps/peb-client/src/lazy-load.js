function setupLazyLoading() {
  setupImageLazyLoading();
  setupIframeLazyLoading();
  setupVideoLazyLoading();
}

function setupImageLazyLoading() {
  const lazyImages = document.querySelectorAll('.peb-lazy-image');

  const imageObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('peb-lazy-loaded');
        entry.target.classList.remove('peb-lazy-image');
        imageObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: "500px" });

  lazyImages.forEach((image) => imageObserver.observe(image));
}

function setupIframeLazyLoading() {
  const lazyIframes = document.querySelectorAll('iframe');

  const iframeObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        const src = iframe.getAttribute('peb-lazy-iframe');
        iframe.src = src;
        iframeObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: "800px" });

  lazyIframes.forEach((elm) => iframeObserver.observe(elm));
}

function setupVideoLazyLoading() {
  const lazyVideos = document.querySelectorAll('video');

  const videoObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const src = video.getAttribute('peb-lazy-video');
        const poster = video.getAttribute('peb-lazy-poster');

        video.src = src;
        video.poster = poster;

        const isPlaying = video.getAttribute('peb-lazy-playing') === 'true';
        isPlaying && ensureVideoPlays(video);

        videoObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: "800px" });

  lazyVideos.forEach((elm) => videoObserver.observe(elm));
}

function ensureVideoPlays(video) {
  const promise = video.play();
  if (promise !== undefined) {
    promise.then(() => {
    }).catch(error => {
      console.error(error);
      video.muted = true;
      video.play();
    });
  }
}

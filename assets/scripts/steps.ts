import { DeviceType } from './tools';
import { PLAY_ICON, REPLAY_ICON, PAUSE_ICON, changeSrc, toggleClass } from './common/index';
import { getPaymentDemoSettings } from '../apps';

const SLIDE_DELAY: number = 2200;

const backButtonNode: HTMLElement | null = document.getElementById('back-button');
const forwardButtonNode: HTMLElement | null = document.getElementById('forward-button');
const autoplayButtonNode: HTMLElement | null = document.getElementById('autoplay-button');

const { stepsCount: stepsCountDesktop, stepsCountMobile, stepsHandler } = getPaymentDemoSettings();
let currentIndex: number = 0;
let autoPlay: boolean = true;
let autoPlayInterval: NodeJS.Timeout;
let stepsCount = stepsCountDesktop;

const steps = async (step: number): Promise<void> => {
  if (step > stepsCount) {
    step = 0;
    currentIndex = 0;
  }
  activateSpot(step, stepsCount);
  disableButton();
  stepsHandler(step);  
};

const disableButton = (): void => {
  toggleClass('back-button', 'disable', currentIndex === 0);
  toggleClass('forward-button', 'disable', currentIndex === stepsCount);
};

let autoPlayTimeoutId: ReturnType<typeof setTimeout>;

const autoPlayButtonIcons = (): void => {
  clearTimeout(autoPlayTimeoutId);

  const setIcon = (icon: string) => changeSrc('autoplay-button', icon);

  if (currentIndex !== stepsCount) {
    setIcon(autoPlay ? PAUSE_ICON : PLAY_ICON);
    return;
  }

  if (!autoPlay) {
    setIcon(REPLAY_ICON);
    return;
  }

  autoPlayTimeoutId = setTimeout(() => {
    if (currentIndex === stepsCount) {
      setIcon(REPLAY_ICON);
    }
  }, SLIDE_DELAY - 300);
};

export const stepsInit = (device: DeviceType = 'desktop', isInited: boolean = false): void => {
  if (device === 'mobile') {
    if (stepsCountMobile) {
      stepsCount = stepsCountMobile;
    }
  } else {
    stepsCount = stepsCountDesktop;
    if (currentIndex === stepsCountMobile) {
      currentIndex = stepsCountDesktop;
    }
  }

  generateSpots(stepsCount);
  backButtonNode?.addEventListener('click', handleStepBack);
  forwardButtonNode?.addEventListener('click', handleStepForward);
  autoplayButtonNode?.addEventListener('click', handleStepsAutoplay);
  if (isInited) {
    return;
  }
  steps(currentIndex);
};

const handleStepBack = (): void => {
  if (currentIndex > 0) {
    currentIndex--;
    steps(currentIndex);
    autoPlayButtonIcons();
  }
}

const handleStepForward = (): void => {
  if (currentIndex < stepsCount) {
    currentIndex++;
    steps(currentIndex);
    disableButton();
    autoPlayButtonIcons();
  }
}

const handleStepsAutoplay = (): void => {
  autoPlay = !autoPlay;
  autoPlayButtonIcons();
  if (autoPlay) {
    steps(++currentIndex);
  }
  autoPlayHandler();
}

const generateSpots = (slideCount: number): void => {
  const spotWrapper: HTMLElement = document.getElementById('step-spots')!;
  spotWrapper.innerHTML = '';

  for (let i = 0; i <= slideCount; i++) {
    const li = document.createElement('li');
    li.className = 'step-spot';
    li.addEventListener('click', function (e) {
      currentIndex = i;
      steps(i);
    });
    spotWrapper.appendChild(li);
  }
  activateSpot(currentIndex, slideCount);
}

const activateSpot = (activeIndex: number, slideCount: number): void => {
  const innerDiv: HTMLElement = document.createElement('div');
  const spots: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('step-spot') as HTMLCollectionOf<HTMLElement>;

  [...spots].forEach((li) => {
    li.classList.remove('active');
  });

  spots[activeIndex].classList.add('active');
  if (autoPlay) {
    innerDiv.className = 'autoplay';
  }
  spots[activeIndex].innerHTML = '';
  spots[activeIndex].appendChild(innerDiv);

  autoPlayHandler();
  if (activeIndex === slideCount) {
    setTimeout(() => {
      if (currentIndex === slideCount) {
        autoPlay = false;
        autoPlayHandler();
      }
    }, SLIDE_DELAY - 300);
  }
  autoPlayButtonIcons();
}

const autoPlayHandler = (): void => {
  clearInterval(autoPlayInterval);
  if (autoPlay) {
    autoPlayInterval = setInterval(() => {
      currentIndex++;
      steps(currentIndex);
    }, SLIDE_DELAY);
  }
}

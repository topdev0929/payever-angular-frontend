import { AnimationMetadata } from '@angular/animations';

import { PebAnimation, PebViewElementEventType } from '@pe/builder/core';

import { PebAnimationService } from './animation.service';

describe('Animation Service', () => {
  it('should be defined', () => {
    const animationService = new PebAnimationService({} as any);
    expect(animationService).toBeDefined();
  });

  it('use opacity inside keyframes', () => {
    const builder = createBuilder();

    const spy = jest.spyOn(builder, 'build');

    const animationService = new PebAnimationService(builder);
    animationService.playAnimation(document.createElement('div'), {
      delay: 10,
      duration: 100,
      iteration: 1,
      trigger: PebViewElementEventType.Click,
      keyframes: [],
    });

    expect(spy).toBeCalledTimes(1);
  });

  it('build method of builder must be called', () => {
    const builder = createBuilder();

    const spy = jest.spyOn(builder, 'build');

    const animationService = new PebAnimationService(builder);
    animationService.playAnimation(document.createElement('div'), {
      delay: 10,
      duration: 100,
      iteration: 1,
      trigger: PebViewElementEventType.Click,
      keyframes: [],
    });

    expect(spy).toBeCalledTimes(1);
  });

  it('keyframes with opacity', () => {
    const animation: any = {
      trigger: 'Click',
      easing: 'cubic-bezier(0.5, 1, 0.89, 1)',
      delay: 0,
      duration: 1000,
      keyframes: [
        {
          offset: 0,
          property: [
            {
              key: 'opacity',
              value: 0,
            },
          ],
        },
        {
          offset: 100,
          property: [
            {
              key: 'opacity',
              value: 100,
            },
          ],
        },
      ],
    };

    const expected = [
      {
        type: 4,
        styles: {
          type: 5,
          steps: [
            {
              type: 6,
              styles: {
                opacity: '0%',
                offset: 0,
              },
              offset: null,
            },
            {
              type: 6,
              styles: {
                opacity: '100%',
                offset: 1,
              },
              offset: null,
            },
          ],
        },
        timings: '1000ms cubic-bezier(0.5, 1, 0.89, 1)',
      },
    ];

    checkExpectedValue(animation, expected);
  });

  it('keyframes with scale', () => {
    const animation: any = {
      trigger: 'Click',
      easing: 'cubic-bezier(0.5, 1, 0.89, 1)',
      delay: 0,
      duration: 1000,
      keyframes: [
        {
          offset: 0,
          property: [
            {
              key: 'scale',
              value: {
                x: 1.2,
                y: 1.2,
                z: 0,
              },
            },
          ],
        },
        {
          offset: 100,
          property: [
            {
              key: 'scale',
              value: {
                x: 1,
                y: 1,
                z: 0,
              },
            },
          ],
        },
      ],
    };

    const expected = [
      {
        type: 4,
        styles: {
          type: 5,
          steps: [
            {
              type: 6,
              styles: {
                transform: 'scale(1.2, 1.2)',
                offset: 0,
              },
              offset: null,
            },
            {
              type: 6,
              styles: {
                transform: 'scale(1, 1)',
                offset: 1,
              },
              offset: null,
            },
          ],
        },
        timings: '1000ms cubic-bezier(0.5, 1, 0.89, 1)',
      },
    ];

    checkExpectedValue(animation, expected);
  });

  it('keyframes with move', () => {
    const animation: any = {
      trigger: 'Click',
      easing: 'cubic-bezier(0.5, 1, 0.89, 1)',
      delay: 0,
      duration: 1000,
      keyframes: [
        {
          offset: 0,
          property: [
            {
              key: 'move',
              value: {
                x: 100,
                y: 100,
                z: 0,
              },
            },
          ],
        },
        {
          offset: 100,
          property: [
            {
              key: 'move',
              value: {
                x: -100,
                y: 0,
                z: 0,
              },
            },
          ],
        },
      ],
    };

    const expected = [
      {
        type: 4,
        styles: {
          type: 5,
          steps: [
            {
              type: 6,
              styles: {
                transform: 'translate(100px, 100px)',
                offset: 0,
              },
              offset: null,
            },
            {
              type: 6,
              styles: {
                transform: 'translate(-100px, 0px)',
                offset: 1,
              },
              offset: null,
            },
          ],
        },
        timings: '1000ms cubic-bezier(0.5, 1, 0.89, 1)',
      },
    ];

    checkExpectedValue(animation, expected);
  });

  it('keyframes with scaleX', () => {
    const animation: any = {
      trigger: 'Click',
      easing: 'cubic-bezier(0.5, 1, 0.89, 1)',
      delay: 0,
      duration: 1000,
      keyframes: [
        {
          offset: 0,
          property: [
            {
              key: 'scaleX',
              value: 1.2,
            },
          ],
        },
        {
          offset: 100,
          property: [
            {
              key: 'scaleX',
              value: 1,
            },
          ],
        },
      ],
    };

    const expected = [
      {
        type: 4,
        styles: {
          type: 5,
          steps: [
            {
              type: 6,
              styles: {
                transform: 'scaleX(1.2)',
                offset: 0,
              },
              offset: null,
            },
            {
              type: 6,
              styles: {
                transform: 'scaleX(1)',
                offset: 1,
              },
              offset: null,
            },
          ],
        },
        timings: '1000ms cubic-bezier(0.5, 1, 0.89, 1)',
      },
    ];

    checkExpectedValue(animation, expected);
  });

  it('keyframes with skew', () => {
    const animation: any = {
      trigger: 'Click',
      easing: 'cubic-bezier(0.5, 1, 0.89, 1)',
      delay: 0,
      duration: 1000,
      keyframes: [
        {
          offset: 0,
          property: [
            {
              key: 'skew',
              value: {
                x: 20,
                y: 30,
                z: 0,
              },
            },
          ],
        },
        {
          offset: 100,
          property: [
            {
              key: 'skew',
              value: {
                x: 100,
                y: 20,
                z: 0,
              },
            },
          ],
        },
      ],
    };

    const expected = [
      {
        type: 4,
        styles: {
          type: 5,
          steps: [
            {
              type: 6,
              styles: {
                transform: 'skew(20deg, 30deg)',
                offset: 0,
              },
              offset: null,
            },
            {
              type: 6,
              styles: {
                transform: 'skew(100deg, 20deg)',
                offset: 1,
              },
              offset: null,
            },
          ],
        },
        timings: '1000ms cubic-bezier(0.5, 1, 0.89, 1)',
      },
    ];

    checkExpectedValue(animation, expected);
  });

  it('keyframes with width', () => {
    const animation: any = {
      trigger: 'Click',
      easing: 'cubic-bezier(0.5, 1, 0.89, 1)',
      delay: 0,
      duration: 1000,
      keyframes: [
        {
          offset: 0,
          property: [
            {
              key: 'width',
              value: 200,
            },
          ],
        },
        {
          offset: 100,
          property: [
            {
              key: 'width',
              value: 30,
            },
          ],
        },
      ],
    };

    const expected = [
      {
        type: 4,
        styles: {
          type: 5,
          steps: [
            {
              type: 6,
              styles: {
                width: '200px',
                offset: 0,
              },
              offset: null,
            },
            {
              type: 6,
              styles: {
                width: '30px',
                offset: 1,
              },
              offset: null,
            },
          ],
        },
        timings: '1000ms cubic-bezier(0.5, 1, 0.89, 1)',
      },
    ];

    checkExpectedValue(animation, expected);
  });
});

function checkExpectedValue(input: PebAnimation, expected: AnimationMetadata[]) {
  const builder = createBuilder();
  const spy = jest.spyOn(builder, 'build');
  const animationService = new PebAnimationService(builder);
  animationService.playAnimation(document.createElement('div'), input);

  expect(spy).toHaveBeenCalledWith(expected);
}

function createBuilder(): any {
  return {
    build: (animations: AnimationMetadata[]) => {
      return {
        create: () => {
          return {
            play: () => {},
            onDone: () => {},
          };
        },
      };
    },
  };
}

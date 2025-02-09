import { Component, EventEmitter } from '@angular/core';

function mockComponent(options: Component, klass: any): any {
  const metadata: Component = { template: '', ...options };

  const classWithEmitters = classWithOutputsEmittersFactory(klass, options.outputs);

  return Component(metadata)(classWithEmitters);
}

function classWithOutputsEmittersFactory(klass: any, outputs: string[] = []): any {
  return class extends klass {
    constructor() {
      super();
      outputs.forEach(
        (output) => {
          this[output] = new EventEmitter();
        },
        this
      );
    }
  };
}

export {
  mockComponent,
};


const ZONE_TASKS: string[] = [
  '__zone_symbol__orientationchangefalse',
  '__zone_symbol__pointercancelfalse',
  '__zone_symbol__pointermovefalse',
  '__zone_symbol__pointerdownfalse',
  '__zone_symbol__hashchangefalse',
  '__zone_symbol__pointerupfalse',
  '__zone_symbol__touchstarttrue',
  '__zone_symbol__popstatefalse',
  '__zone_symbol__keydownfalse',
  '__zone_symbol__keydowntrue',
  '__zone_symbol__focusfalse',
  '__zone_symbol__resizefalse',
  '__zone_symbol__mousemovefalse',
  '__zone_symbol__mousedownfalse',
  '__zone_symbol__mousewheelfalse',
  '__zone_symbol__mouseupfalse',
  '__zone_symbol__scrollfalse',
  '__zone_symbol__storagefalse',
  '__zone_symbol__clickfalse',
];

export class PlatformAppLoader {

  private zone: any = window['rootZone'];

  private zoneObservers: WeakMap<any, boolean> = new WeakMap();

  private fwStabilizers: WeakMap<any, boolean> = new WeakMap();

  get stabilizers(): any[] {
    return window['frameworkStabilizers'] || [];
  }

  private jsonsName: string = '';

  private wZoneTasks: {[key: string]: WeakMap<any, boolean>} = {};
  private dZoneTasks: {[key: string]: WeakMap<any, boolean>} = {};

  constructor(jsonName?: string) {
    this.startApplication = this.startApplication.bind(this);

    this.jsonsName = (jsonName && jsonName.length > 12) ? jsonName : '';

    // If app started with out Platform
    if (this.zone) {
      this.zone.onError.observers.forEach((observer: any) => {
        this.zoneObservers.set(observer, true);
      });
      this.zone.onStable.observers.forEach((observer: any) => {
        this.zoneObservers.set(observer, true);
      });
      this.zone.onUnstable.observers.forEach((observer: any) => {
        this.zoneObservers.set(observer, true);
      });
      this.zone.onMicrotaskEmpty.observers.forEach((observer: any) => {
        this.zoneObservers.set(observer, true);
      });
    }

    this.stabilizers.forEach(s => {
      this.fwStabilizers.set(s, true);
    });

    ZONE_TASKS.forEach(n => {
      const zTasks: any[] = (window[n] || []);
      const wmTasks: WeakMap<any, boolean> = this.wZoneTasks[n] = new WeakMap();
      zTasks.forEach(t => wmTasks.set(t, true));
    });

    ZONE_TASKS.forEach(n => {
      const zTasks: any[] = (document[n] || []);
      const wmTasks: WeakMap<any, boolean> = this.dZoneTasks[n] = new WeakMap();
      zTasks.forEach(t => wmTasks.set(t, true));
    });

  }

  public bootstrap(): {ngZone: any} {
    return this.zone && {
      ngZone: this.zone
    };
  }

  public startApplication(appModule: any): void {
    const destroyHandler: () => void = () => {
      window.removeEventListener('pe-destroy-micro-app', destroyHandler);
      appModule.destroy();
      this.destroyApplication();
    };
    window.addEventListener('pe-destroy-micro-app', destroyHandler);
  }

  private destroyApplication(): void {
    if (this.zone) {
      this.zone.onError.observers = this.zone.onError.observers.filter((obs: any) => {
        return this.zoneObservers.has(obs);
      });
      this.zone.onStable.observers = this.zone.onStable.observers.filter((obs: any) => {
        return this.zoneObservers.has(obs);
      });
      this.zone.onUnstable.observers = this.zone.onUnstable.observers.filter((obs: any) => {
        return this.zoneObservers.has(obs);
      });
      this.zone.onMicrotaskEmpty.observers = this.zone.onMicrotaskEmpty.observers.filter((obs: any) => {
        return this.zoneObservers.has(obs);
      });
    }

    window['frameworkStabilizers'] = this.stabilizers.filter((s: any) => {
      return this.fwStabilizers.has(s);
    });

    if (this.jsonsName) {
      window[this.jsonsName] = [];
    }

    ZONE_TASKS.forEach(n => {
      const zTasks: any[] = (window[n] || []);
      const wmTasks: WeakMap<any, boolean> = this.wZoneTasks[n];
      for (let i: number = zTasks.length - 1; i >= 0; i--) {
        const task: any = zTasks[i];

        if (!wmTasks.has(task)) {
          zTasks.splice(i, 1);

          task.isRemoved = true;

          if (zTasks.length === 0) {
            task.allRemoved = true;
            delete window[n];
          }

          task.zone.cancelTask(task);
        }
      }
    });

    this.wZoneTasks = {};

    ZONE_TASKS.forEach(n => {
      const zTasks: any[] = (document[n] || []);
      const wmTasks: WeakMap<any, boolean> = this.dZoneTasks[n];
      for (let i: number = zTasks.length - 1; i >= 0; i--) {
        const task: any = zTasks[i];

        if (!wmTasks.has(task)) {
          zTasks.splice(i, 1);

          task.isRemoved = true;

          if (zTasks.length === 0) {
            task.allRemoved = true;
            delete window[n];
          }

          task.zone.cancelTask(task);
        }
      }
    });

    this.dZoneTasks = {};

  }

}

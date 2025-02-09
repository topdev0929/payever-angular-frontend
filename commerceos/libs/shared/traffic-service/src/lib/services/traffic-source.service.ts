import { Injectable } from '@angular/core';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { TrafficSourceInterface } from '@pe/api';

@Injectable({ providedIn:'root' })
export class TrafficSourceService {
  private readonly storageKey: string = 'trafficSource';

  // returns source if valid, if not null
  getSource(): TrafficSourceInterface {
    const sourceStorage: string = sessionStorage.getItem(this.storageKey);

    // if no data saved return
    if (!sourceStorage) {
      return null;
    }

    const source = JSON.parse(sourceStorage);

    if (this.isSourceValid(source)) {
      return source as TrafficSourceInterface;
    }

    return null;
  }

  removeSource(): void {
    sessionStorage.removeItem(this.storageKey);
  }

  private isSourceValid(source: TrafficSourceInterface): boolean {
    return source.source !== '' || source.medium !== '' || source.campaign !== '' || source.content !== '';
  }
}

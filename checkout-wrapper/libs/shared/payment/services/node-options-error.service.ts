import { Injectable, ViewContainerRef, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';

import { NodeOptionsErrorComponent } from '../components';

@Injectable()
export class NodeOptionsErrorService {
  handleError(err: Error, containerRef: ViewContainerRef): Observable<MouseEvent> {
    // eslint-disable-next-line
    if (isDevMode()) { console.error(err) };

    const { instance } = containerRef.createComponent(NodeOptionsErrorComponent);

    return instance.tryAgain;
  }
}

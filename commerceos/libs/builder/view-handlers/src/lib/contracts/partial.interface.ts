import { Observable } from 'rxjs';

import { PebPartialContent, PebRenderElementModel } from '@pe/builder/core';

export abstract class PebPartialContentService {
  abstract loadContent$(partial: PebPartialContent): Observable<PebRenderElementModel | undefined>;
}

import { Select } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StudioAppModel, StudioAppState } from './studio.app.state';
import { PeStudioAlbum } from '../interfaces/studio-album.interface';
import { PeAttribute } from '../interfaces/studio-attributes.interface';
import { PeStudioCategory } from '../interfaces/studio-category.interface';

@Injectable()
export class StudioStoreSelectors {

  @Select(state => state.studio.albums) albums$: Observable<PeStudioAlbum[]>;

  @Select(state => state.studio.attributes) attributes$: Observable<PeAttribute[]>;

  @Select() studio$: Observable<StudioAppModel>;

  @Select(StudioAppState.studioCategories) categories$: Observable<PeStudioCategory[]>;
}

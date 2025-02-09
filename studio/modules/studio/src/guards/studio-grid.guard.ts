import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { PeStudioWs } from '../core';
import { InitLoadAlbums } from '../core/store/albums.actions';
import { InitLoadAttributes } from '../core/store/attributes.actions';
import { LoadCategories } from '../core/store/categories.actions';

@Injectable()
export class StudioGridGuard implements CanActivate {


    constructor(private store: Store, private studioWs: PeStudioWs) {
    }
    canActivate(routeSnapshot: ActivatedRouteSnapshot): boolean|Observable<boolean> {
        this.studioWs.connect();
        return this.store.dispatch([
            new InitLoadAttributes(routeSnapshot.parent.params.slug),
            new InitLoadAlbums(routeSnapshot.parent.params.slug),
        ]).pipe(
            map(([_, response]) => this.store.dispatch(new LoadCategories(response.studio.attributes, response.studio.albums))),
            map(() => true),
            take(1));

    }
}

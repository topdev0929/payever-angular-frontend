// import { Injectable } from '@angular/core';
// import { omit, orderBy } from 'lodash';
// import { NgxIndexedDBService } from 'ngx-indexed-db';
// import { of } from 'rxjs';
// import { delay, map } from 'rxjs/operators';
// import { HttpEventType } from '@angular/common/http';
//
// import {
//   PebAction,
//   pebActionHandler,
//   pebCloneShopTheme,
//   pebCompileActions,
//   pebCreateShopInitAction,
//   pebGenerateId,
//   PebPageId,
//   PebShop,
//   PebShopId,
//   PebShopThemeEntity,
//   PebShopThemeId,
//   PebShopThemeSnapshotEntity,
//   PebShopThemeSourceEntity,
//   PebShopThemeVersionEntity,
//   PebShopThemeVersionId,
// } from '@pe/builder-core';
//
// import { DatabaseEntity } from './editor.idb-config';
// import { ImitateHttp } from './imitate-http.decorator';
// import { MockLockingService } from './locking.service';
// import { PebEditorApi } from '@pe/builder-api';
//
// export interface AddShopThemeInput {
//   name: string;
//   content: PebShop;
// }
//
// @Injectable({ providedIn: 'root' })
// export class SandboxMockBackend  /* implements PebAbstractEditorApi */ {
//   locking = new MockLockingService();
//
//   constructor(private idb: NgxIndexedDBService) {}
//
//   //
//   //  Theme methods
//   //
//   @ImitateHttp
//   async getAllAvailableThemes() {
//     return this.idb.getAll(DatabaseEntity.ShopTheme);
//   }
//
//   @ImitateHttp
//   async getShopThemesList() {
//     return this.idb.getAll(DatabaseEntity.ShopTheme);
//   }
//
//   @ImitateHttp
//   async getShopActiveTheme(){
//     return "1";
//   }
//
//   @ImitateHttp
//   async getShopThemeById(id) {
//     const shopTheme = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, id,
//     );
//     const shopSource = await this.idb.getByID<PebShopThemeSourceEntity>(
//       DatabaseEntity.ShopThemeSource, shopTheme.sourceId,
//     );
//     const shopSnapshot = await this.idb.getByID<PebShopThemeSnapshotEntity>(
//       DatabaseEntity.ShopThemeSnapshot, shopSource.snapshotId,
//     );
//
//     return {
//       ...omit(shopTheme, 'sourceId'),
//       source: {
//         ...omit(shopSource, 'snapshotId'),
//         snapshot: shopSnapshot,
//       },
//     };
//   }
//
//   @ImitateHttp
//   async createShopTheme(input: AddShopThemeInput) {
//     const content = pebCloneShopTheme(input.content);
//
//     const actions = [pebCreateShopInitAction(content)];
//     const snapshot = pebCompileActions(actions);
//
//     const snapshotEntity: PebShopThemeSnapshotEntity = {
//       ...snapshot,
//       id: pebGenerateId('snapshot'),
//     };
//     const sourceEntity: PebShopThemeSourceEntity = {
//       id: pebGenerateId('source'),
//       actions,
//       snapshotId: snapshotEntity.id,
//     };
//     const themeEntity: PebShopThemeEntity = {
//       id: pebGenerateId('theme'),
//       name: input.name,
//       picture: null,
//       sourceId: sourceEntity.id,
//       versionsIds: [],
//       publishedId: null,
//     };
//
//     return Promise.all([
//       this.idb.add(DatabaseEntity.ShopTheme, themeEntity),
//       this.idb.add(DatabaseEntity.ShopThemeSource, sourceEntity),
//       this.idb.add(DatabaseEntity.ShopThemeSnapshot, snapshotEntity),
//     ]).then(() => themeEntity);
//   }
//
//   //
//   //  General flow
//   //
//   @ImitateHttp
//   async addAction(shopId, action) {
//     const lock = await this.locking.acquireLock(shopId);
//
//     const shopTheme = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, shopId,
//     );
//     let shopSource = await this.idb.getByID<PebShopThemeSourceEntity>(
//       DatabaseEntity.ShopThemeSource, shopTheme.sourceId,
//     );
//     let shopSnapshot = await this.idb.getByID<PebShopThemeSnapshotEntity>(
//       DatabaseEntity.ShopThemeSnapshot, shopSource.snapshotId,
//     );
//
//     shopSource = {
//       ...shopSource,
//       actions: [...shopSource.actions, action],
//     };
//
//     shopSnapshot = pebActionHandler(shopSnapshot, action);
//
//     await Promise.all([
//       this.idb.update(DatabaseEntity.ShopThemeSource, shopSource),
//       this.idb.update(DatabaseEntity.ShopThemeSnapshot, shopSnapshot),
//     ]);
//     await lock.release();
//
//     return { snapshot: shopSnapshot };
//   }
//
//   @ImitateHttp
//   async undoAction(themeId: PebShopId, actionId: string) {
//     const lock = await this.locking.acquireLock(themeId);
//
//     let { source, snapshot } = await this.getThemeWithRelations(themeId);
//     // const removedAction = this.source.actions.find(a => a.id === actionId);
//
//     source = {
//       ...source,
//       actions: source.actions.filter(a => a.id !== actionId),
//     };
//     snapshot = {
//       ...pebCompileActions(source.actions),
//       id: snapshot.id,
//     };
//
//     await Promise.all([
//       this.idb.update(DatabaseEntity.ShopThemeSource, source),
//       this.idb.update(DatabaseEntity.ShopThemeSnapshot, snapshot),
//     ])
//     await lock.release()
//
//     return { snapshot };
//   }
//
//   @ImitateHttp
//   async updateReplica(themeId, oldInitAction: PebAction, newInitAction: PebAction) {
//     let { source, snapshot } = await this.getThemeWithRelations(themeId);
//
//     source = {
//       ...source,
//       actions: source.actions.map(
//         a => a.id === oldInitAction.id ? newInitAction : a,
//       ),
//     };
//
//     snapshot = {
//       ...pebCompileActions(source.actions),
//       id: snapshot.id,
//     };
//
//     return Promise.all([
//       this.idb.update(DatabaseEntity.ShopThemeSource, source),
//       this.idb.update(DatabaseEntity.ShopThemeSnapshot, snapshot),
//     ]).then(() => ({ snapshot }));
//   }
//
//   //
//   //  Versioning
//   //
//   @ImitateHttp
//   async getShopThemeVersions(themeId: PebShopThemeId) {
//     const shopTheme: PebShopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, themeId,
//     );
//
//     // https://github.com/w3c/IndexedDB/issues/19
//     return Promise.all<PebShopThemeVersionEntity>(
//       shopTheme.versionsIds.map(id => this.idb.getByID(DatabaseEntity.ShopThemeVersion, id)),
//     ).then(versions => orderBy(versions, v => v.createdAt, ['desc']));
//   }
//
//   @ImitateHttp
//   async createShopThemeVersion(shopId: PebShopId, name: string) {
//     const shopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, shopId,
//     );
//
//     const currentSourceEntity = await this.idb.getByID<PebShopThemeSourceEntity>(
//       DatabaseEntity.ShopThemeSource, shopThemeEntity.sourceId,
//     );
//     const currentSnapshotEntity = await this.idb.getByID<PebShopThemeSnapshotEntity>(
//       DatabaseEntity.ShopThemeSnapshot, currentSourceEntity.snapshotId,
//     );
//
//     const duplicatedSnapshotEntity: PebShopThemeSnapshotEntity = {
//       ...currentSnapshotEntity,
//       id: pebGenerateId(),
//     };
//
//     const savedSnapshotEntity = await this.idb
//       .add(DatabaseEntity.ShopThemeSnapshot, duplicatedSnapshotEntity)
//       .then(() => ({ ...duplicatedSnapshotEntity }));
//
//     const duplicatedSourceEntity: PebShopThemeSourceEntity = {
//       ...currentSourceEntity,
//       id: pebGenerateId(),
//       snapshotId: savedSnapshotEntity.id,
//     };
//
//     const savedSourceEntity = await this.idb
//       .add(DatabaseEntity.ShopThemeSource, duplicatedSourceEntity)
//       .then(() => ({ ...duplicatedSourceEntity }));
//
//     const versionEntity: PebShopThemeVersionEntity = {
//       id: pebGenerateId(),
//       name,
//       sourceId: savedSourceEntity.id,
//       result: null, // will be calculated on publication
//       createdAt: new Date(),
//     };
//
//     const nextShopThemeEntity: PebShopThemeEntity = {
//       ...shopThemeEntity,
//       versionsIds: [...shopThemeEntity.versionsIds, versionEntity.id],
//     };
//
//     await this.idb.update(DatabaseEntity.ShopTheme, nextShopThemeEntity);
//
//     return this.idb
//       .add(DatabaseEntity.ShopThemeVersion, versionEntity)
//       .then(() => ({ ...versionEntity }));
//   }
//
//   @ImitateHttp
//   async deleteShopThemeVersion(shopId: PebShopId, versionId: PebShopThemeVersionId) {
//     const shopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, shopId,
//     );
//
//     if (shopThemeEntity.publishedId === versionId) {
//       throw new Error('Can\'t delete published version');
//     }
//
//     if (!shopThemeEntity.versionsIds.find(id => id === versionId)) {
//       throw new Error('There is no version in theme');
//     }
//
//     const versionEntity = await this.idb.getByID<PebShopThemeVersionEntity>(
//       DatabaseEntity.ShopThemeVersion, versionId,
//     );
//
//     const sourceEntity = await this.idb.getByID<PebShopThemeSourceEntity>(
//       DatabaseEntity.ShopThemeSource, versionEntity.sourceId,
//     );
//
//     if (shopThemeEntity.sourceId === sourceEntity.id) {
//       throw new Error('Can\'t delete activated version');
//     }
//
//     const snapshotEntity = await this.idb.getByID<PebShopThemeSnapshotEntity>(
//       DatabaseEntity.ShopThemeSnapshot, sourceEntity.snapshotId,
//     );
//
//     const shopSource: PebShopThemeEntity = {
//       ...shopThemeEntity,
//       versionsIds: shopThemeEntity.versionsIds.filter(id => id !== versionId),
//     };
//
//     return Promise.all([
//       this.idb.delete(DatabaseEntity.ShopThemeVersion, versionEntity.id),
//       this.idb.delete(DatabaseEntity.ShopThemeSource, sourceEntity.id),
//       this.idb.delete(DatabaseEntity.ShopThemeSnapshot, snapshotEntity.id),
//       this.idb.update(DatabaseEntity.ShopTheme, shopSource),
//     ]);
//   }
//
//   @ImitateHttp
//   async activateShopThemeVersion(shopId: PebShopId, versionId: PebShopThemeVersionId) {
//     const shopThemeEntity = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, shopId,
//     );
//
//     const versionEntity = await this.idb.getByID<PebShopThemeVersionEntity>(
//       DatabaseEntity.ShopThemeVersion, versionId,
//     );
//
//     // TODO: Delete 04.05.20 if not encountered
//     if (shopThemeEntity.sourceId === versionEntity.sourceId) {
//       throw new Error('Already activated');
//     }
//
//     const sourceEntityToDelete = await this.idb
//       .getByID<PebShopThemeSourceEntity>(DatabaseEntity.ShopThemeSource, shopThemeEntity.sourceId);
//     await this.idb.delete(DatabaseEntity.ShopThemeSource, sourceEntityToDelete.id);
//     await this.idb.delete(DatabaseEntity.ShopThemeSnapshot, sourceEntityToDelete.snapshotId);
//
//     const versionSourceEntity = await this.idb
//       .getByID<PebShopThemeSourceEntity>(DatabaseEntity.ShopThemeSource, versionEntity.sourceId);
//
//     const versionSnapshotEntity = await this.idb
//       .getByID<PebShopThemeSourceEntity>(DatabaseEntity.ShopThemeSnapshot, versionSourceEntity.snapshotId);
//
//     const duplicatedSnapshotEntity: PebShopThemeSourceEntity = {
//       ...versionSnapshotEntity,
//       id: pebGenerateId(),
//     };
//
//     const duplicatedSourceEntity: PebShopThemeSourceEntity = {
//       ...versionSourceEntity,
//       id: pebGenerateId(),
//       snapshotId: duplicatedSnapshotEntity.id,
//     };
//
//     const nextShopThemeEntity: PebShopThemeEntity = {
//       ...shopThemeEntity,
//       sourceId: duplicatedSourceEntity.id,
//     };
//
//     return Promise.all([
//       this.idb.update(DatabaseEntity.ShopTheme, nextShopThemeEntity),
//       this.idb.add(DatabaseEntity.ShopThemeSnapshot, duplicatedSnapshotEntity),
//       this.idb.add(DatabaseEntity.ShopThemeSource, duplicatedSourceEntity),
//     ]).then((e) => ({
//       ...nextShopThemeEntity,
//       source: {
//         ...duplicatedSourceEntity,
//         snapshot: duplicatedSnapshotEntity,
//       },
//     }));
//   }
//
//   @ImitateHttp
//   async publishShopThemeVersion(shopId: PebShopId, versionId: PebShopThemeVersionId) {
//     const shopTheme = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, shopId,
//     );
//
//     if (shopTheme.publishedId === versionId) {
//       throw new Error('Already published');
//     }
//
//     const version = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopThemeVersion, versionId,
//     );
//
//     // TODO: Calculate result for PebShopThemeVersionEntity
//
//     const shopSource = {
//       ...shopTheme,
//       publishedId: version.id,
//     };
//
//     return this.idb.update(DatabaseEntity.ShopTheme, shopSource);
//   }
//
//   @ImitateHttp
//   async updateBlog(payload: any) {
//     of(null);
//   }
//
//   @ImitateHttp
//   async getShop(shopId: PebShopId) {
//     return {
//       shopId,
//       businessId: '',
//       channelId: '',
//       name: 'Test Shop',
//       picture: null,
//       isDefault: false,
//       deploy: {
//         shopId,
//         isLive: false,
//         internalDomain: '',
//         ownDomain: null,
//         isPrivate: false,
//         privateMessage: null,
//         privatePassword: null,
//       },
//     };
//   }
//
//   @ImitateHttp
//   uploadImage(container: string, file: File) {
//     return of({
//       blobName: URL.createObjectURL(file),
//       brightnessGradation: 'default',
//       preview: '',
//     });
//   }
//
//   @ImitateHttp
//   uploadVideo(container: string, file: File) {
//     return of({
//       blobName: URL.createObjectURL(file),
//       brightnessGradation: 'default',
//       preview: '',
//     });
//   }
//
//   @ImitateHttp
//   uploadVideoWithProgress(container: string, file: File) {
//     return of(null).pipe(
//       delay(500),
//       map(_ => ({
//         body: {
//           blobName: '',
//           brightnessGradation: 'default',
//           preview: '',
//         },
//         type: HttpEventType.UploadProgress,
//         loaded: 50,
//       })),
//       delay(1000),
//       map(_ => ({
//         body: {
//           blobName: URL.createObjectURL(file),
//           brightnessGradation: 'default',
//           preview: '',
//         },
//         type: HttpEventType.Response,
//         loaded: 100,
//       })),
//     );
//   }
//
//   @ImitateHttp
//   uploadImageWithProgress(container: string, file: File) {
//     return of(null).pipe(
//       delay(500),
//       map(_ => ({
//         body: {
//           blobName: '',
//           brightnessGradation: 'default',
//           preview: '',
//         },
//         type: HttpEventType.UploadProgress,
//         loaded: 50,
//       })),
//       delay(1000),
//       map(_ => ({
//         body: {
//           blobName: URL.createObjectURL(file),
//           brightnessGradation: 'default',
//           preview: '',
//         },
//         type: HttpEventType.Response,
//         loaded: 100,
//       })),
//     );
//   }
//
//   @ImitateHttp
//   getProductsCategories() {
//     return of([
//       {
//         title: 'First category',
//         id: '1',
//       },
//       {
//         title: 'Second category',
//         id: '2',
//       },
//       {
//         title: 'Third category',
//         id: '3',
//       },
//       {
//         title: 'Fourth category',
//         id: '4',
//       },
//     ]);
//   }
//
//   @ImitateHttp
//   getProducts() {
//     return of([
//       {
//         id: '1',
//         images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
//         title: 'Sport sneakers',
//         price: 1200,
//       },
//       {
//         id: '2',
//         images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
//         title: 'Sport sneakers',
//         price: 1200,
//       },
//       {
//         id: '3',
//         images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
//         title: 'Sport sneakers',
//         price: 1200,
//       },
//       {
//         id: '4',
//         images: ['https://payeverproduction.blob.core.windows.net/builder/30620168-61f3-4961-8252-224ba3cb6633-nike-dream.jpg'],
//         title: 'Sport sneakers',
//         price: 1200,
//       },
//     ])
//   }
//
//   //
//   //  Utils
//   //
//   private async getThemeWithRelations(themeId: string) {
//     const theme = await this.idb.getByID<PebShopThemeEntity>(
//       DatabaseEntity.ShopTheme, themeId,
//     );
//     const source = await this.idb.getByID<PebShopThemeSourceEntity>(
//       DatabaseEntity.ShopThemeSource, theme.sourceId,
//     );
//     const snapshot = await this.idb.getByID<PebShopThemeSnapshotEntity>(
//       DatabaseEntity.ShopThemeSnapshot, source.snapshotId,
//     );
//
//     return { theme, source, snapshot };
//   }
// }

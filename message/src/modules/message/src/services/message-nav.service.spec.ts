import { PeMessageNavService } from './message-nav.service';

describe('PeMessageNavService', () => {

  const service = new PeMessageNavService();

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set/get active folder', () => {

    const nextSpy = spyOn(service[`activeFolderBs`], 'next').and.callThrough();
    const folder = { _id: 'f-001' };

    service.activeFolder = folder;

    expect(nextSpy).toHaveBeenCalledWith(folder);
    expect(service.activeFolder).toEqual(folder);
    service.activeFolder$.subscribe(f => expect(f).toEqual(folder));

  });

  it('should have properties', () => {

    expect(service.folderList).toEqual([]);
    expect(service.folderTree).toEqual([]);

  });

});

import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageFolderFormComponent } from './message-folder-form.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

describe('PeMessageFolderFormComponent', () => {

  let fixture: ComponentFixture<PeMessageFolderFormComponent>;
  let component: PeMessageFolderFormComponent;
  let peOverlayData: any;

  beforeEach(waitForAsync(() => {

    const peOverlayDataMock = {
      theme: 'light',
      folder: {
        _id: 'f-001',
        name: 'Folder 1',
        parentFolder: 'parent',
      },
      newFolder: null,
    };

    TestBed.configureTestingModule({
      declarations: [
        PeMessageFolderFormComponent,
        TranslatePipeMock,
      ],
      providers: [
        FormBuilder,
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageFolderFormComponent);
      component = fixture.componentInstance;

      peOverlayData = TestBed.inject(PE_OVERLAY_DATA);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set form values', () => {

    expect(component.folderFormGroup.value).toEqual({
      _id: 'f-001',
      name: 'Folder 1',
      parentFolder: 'parent',
    });

    component.folderFormGroup.patchValue({
      parentFolder: 'parent.folder',
    });

    expect(component.folderFormGroup.value).toEqual({
      _id: 'f-001',
      name: 'Folder 1',
      parentFolder: 'parent.folder',
    });
    expect(peOverlayData.newFolder).toEqual({
      _id: 'f-001',
      name: 'Folder 1',
      parentFolder: 'parent.folder',
    });

  });

});

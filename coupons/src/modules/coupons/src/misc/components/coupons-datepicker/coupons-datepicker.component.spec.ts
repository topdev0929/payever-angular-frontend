import { Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment_ from 'moment';
import { PeCouponsDatepickerComponent } from './coupons-datepicker.component';
const moment = moment_;

describe('PeCouponsDatepickerComponent', () => {

  let fixture: ComponentFixture<PeCouponsDatepickerComponent>;
  let component: PeCouponsDatepickerComponent;
  let dialogRef: jasmine.SpyObj<any>;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(async(() => {

    const dialogRefMock = {
      close: jasmine.createSpy('close'),
    };

    const rendererSpy = jasmine.createSpyObj<Renderer2>('Renderer2', ['removeClass']);

    TestBed.configureTestingModule({
      imports: [
        MatDatepickerModule,
        MatMomentDateModule,
      ],
      declarations: [PeCouponsDatepickerComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: Renderer2, useValue: rendererSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsDatepickerComponent);
      component = fixture.componentInstance;

      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<any>;
      renderer = TestBed.inject(Renderer2) as jasmine.SpyObj<Renderer2>;

      component[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng after view init', () => {

    fixture.detectChanges();

    expect(renderer.removeClass).toHaveBeenCalledWith(component.wrapper.nativeElement.children[0], 'mat-calendar');

  });

  it('should handle selected change', () => {

    const date = moment().add(3, 'days');

    component.selectedChangeOn(date);

    expect(dialogRef.close).toHaveBeenCalledWith(date);

  });

});

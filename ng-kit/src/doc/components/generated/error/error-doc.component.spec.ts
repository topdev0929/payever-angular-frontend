import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ErrorDocComponent } from './error-doc.component';
import { ErrorComponent } from '../../../../kit/error';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CodePipe } from '../../../pipes/code.pipe';

describe('RootComponent', () => {
  let fixture: ComponentFixture<ErrorDocComponent>;
  let component: ErrorDocComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ErrorDocComponent,
        ErrorComponent,
        CodePipe
      ],
      imports: [
        RouterTestingModule,
        TabsModule.forRoot()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorDocComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component)
      .toBeTruthy();
  });
});

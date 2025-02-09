import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RateSimpleComponent } from './rate-simple.component';
import { RateOption } from '../../rate.interface';

describe('RateDkComponent', () => {
  let component: RateSimpleComponent;
  let fixture: ComponentFixture<RateSimpleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ RateSimpleComponent ]
    });

    fixture = TestBed.createComponent(RateSimpleComponent);
    component = fixture.componentInstance;
  });

  it('Should contains title', async(() => {
    const title: string = 'Rate title';
    component.title = title;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.rate-title')).nativeElement.innerHTML).toEqual(title);
  }));

  it('Should contains rate options', async(() => {
    const rateOptions: RateOption[] = [
      {
        label: 'Option 1',
        val: 'Value 1'
      },
      {
        label: 'Option 2',
        val: 'value 2'
      }
    ];
    component.rateOptions = rateOptions;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.rate-option')).length).toEqual(rateOptions.length);
  }));
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PeCouponsListItemComponent } from './coupons-list-item.component';

describe('PeCouponsListItemComponent', () => {

  let fixture: ComponentFixture<PeCouponsListItemComponent>;
  let component: PeCouponsListItemComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [PeCouponsListItemComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsListItemComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should emit onRemove', () => {

    const emitSpy = spyOn(component.onRemove, 'emit');

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.list-item__remove'))?.nativeElement as HTMLButtonElement;

    expect(button).toBeDefined();
    expect(button.innerText).toEqual('Remove');
    button.click();
    expect(emitSpy).toHaveBeenCalled();

  });

});

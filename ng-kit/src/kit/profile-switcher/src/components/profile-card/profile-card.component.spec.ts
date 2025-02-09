import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PeProfileCardComponent, ProfileSpinnerComponent} from '..';
import {ProfileCardType} from '../../interfaces';
import {ProfileSwitcherModule} from '../../profile-switcher.module';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {click, profileCardConfig} from '../../profile-switcher-spec-helpers';
import {AbbreviationPipe} from '../../../../common/src/pipes';

describe('PeProfileCardComponent', () => {
  let component: PeProfileCardComponent;
  let fixture: ComponentFixture<PeProfileCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, MatCardModule, MatProgressSpinnerModule, NoopAnimationsModule, ProfileSwitcherModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeProfileCardComponent);
    component = fixture.componentInstance;
    component.config = profileCardConfig();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('added app-class if type is App', () => {
    component.config = profileCardConfig({type: ProfileCardType.App});
    fixture.detectChanges();
    const classes = fixture.debugElement.query(By.directive(MatCard)).classes;
    expect(classes['app-card']).toBeTruthy();
  });

  it('shows cardTitle', () => {
    component.config = profileCardConfig({cardTitle: 'card title'});
    fixture.detectChanges();
    const headerText = fixture.debugElement.query(By.css('.profile-header')).nativeElement.innerText;
    expect(headerText).toBe('card title');
  });

  it('emits cardButtonClicked on mat-card-logo-wrapper click', () => {
    let emitted = false;
    component.cardButtonClicked.subscribe(() => emitted = true);
    click(fixture.debugElement.query(By.css('.mat-card-logo-wrapper')));
    expect(emitted).toBeTruthy();
  });

  it('shows pe-profile-card-spinner in mat-card-logo-wrapper when showLoader - true', () => {
    component.showLoader = true;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(ProfileSpinnerComponent))).toBeTruthy();
  });

  it('shows image in logo wrapper when config images not empty', () => {

    const getImg = () => {
      return fixture.debugElement.query(By.css('.mat-card-logo-wrapper img[src="image.jpg"]'));
    };

    component.config = profileCardConfig({
      images: ['image.jpg'],
    });
    fixture.detectChanges();
    expect(getImg()).toBeTruthy();

    component.config = profileCardConfig({
      images: [],
    });
    fixture.detectChanges();
    expect(getImg()).toBeFalsy();
  });

  it('shows svg.icon in logo wrapper when config images is empty and type id Personal', () => {
    const cases = [
      {type: ProfileCardType.Personal, iconShouldBe: true},
      {type: ProfileCardType.App, iconShouldBe: false},
      {type: ProfileCardType.Business, iconShouldBe: false},
    ];

    for (let testCase of cases) {
      component.config = profileCardConfig({
        images: [],
        type: testCase.type
      });
      fixture.detectChanges();
      const icon = fixture.debugElement.query(By.css('.mat-card-logo-wrapper svg.icon'));
      testCase.iconShouldBe ? expect(icon).toBeTruthy() : expect(icon).toBeFalsy();
    }

  });

  it('shows abbreviation in logo wrapper when type is Business or App', () => {
    for (let type of [ProfileCardType.App, ProfileCardType.Business]) {
      component.config = profileCardConfig({
        images: [],
        type: type,
        placeholderTitle: 'placeholder Title'
      });
      fixture.detectChanges();
      const inner = fixture.debugElement.query(By.css('.mat-card-logo-wrapper h2')).nativeElement.innerHTML;
      expect(inner).toContain((new AbbreviationPipe).transform('placeholder Title'));
    }
  });

  it('shows button with cardButtonText and emits on click any type case', () => {
    for (let type of [ProfileCardType.App, ProfileCardType.Business, ProfileCardType.Personal]) {
      component.config = profileCardConfig({
        type: type,
        cardButtonText: 'card button text'
      });
      fixture.detectChanges();
      const buttonText = fixture.debugElement.query(By.css('button')).nativeElement.innerText;
      expect(buttonText).toContain('card button text');
    }
  });

  it('shows svg dropdown arrow when type is business and images more than one', () => {
    component.config = profileCardConfig({
      type: ProfileCardType.Business,
      images: ['img1.jpg', 'img2.jpg']
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('button svg.icon-16'))).toBeTruthy();
  });

  it('applies opened class to svg when type is business and images not empty and opened true', () => {
    component.config = profileCardConfig({
      type: ProfileCardType.Business,
      images: ['img1.jpg', 'img2.jpg']
    });
    component.opened = true;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('button svg.icon-16')).classes['opened']).toBeTruthy();
  });

  it('toggles open and emit footerButtonClicked on business button click when images not empty', () => {
    let emitted = false;
    component.footerButtonClicked.subscribe(() => emitted = true);
    component.config = profileCardConfig({
      type: ProfileCardType.Business,
      images: ['img1.jpg', 'img2.jpg']
    });
    fixture.detectChanges();
    click(fixture.debugElement.query(By.css('button')));
    expect(emitted).toBeTruthy();
  });

  it('emits cardButtonClicked on business button click when images are empty', () => {
    let emitted = false;
    component.cardButtonClicked.subscribe(() => emitted = true);
    component.config = profileCardConfig({
      type: ProfileCardType.Business,
      images: []
    });
    fixture.detectChanges();
    click(fixture.debugElement.query(By.css('button')));
    expect(emitted).toBeTruthy();
  });
});

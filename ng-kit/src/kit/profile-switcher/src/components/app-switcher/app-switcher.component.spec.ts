import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PeAppSwitcherComponent, PeProfileCardComponent, PeSwitcherBusinessListComponent} from '..';
import {PeProfileCardInterface} from '../../interfaces';
import {ProfileSwitcherModule} from '../../profile-switcher.module';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {getComponent, profileCard, profileCardConfig} from '../../profile-switcher-spec-helpers';
import {By} from '@angular/platform-browser';

describe('PeAppSwitcherComponent', () => {
  let component: PeAppSwitcherComponent;
  let fixture: ComponentFixture<PeAppSwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, MatCardModule, MatProgressSpinnerModule, NoopAnimationsModule, ProfileSwitcherModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeAppSwitcherComponent);
    component = fixture.componentInstance;
    component.list = [
      profileCard({logo: 'logo1.jpg', name: 'john'}),
      profileCard({logo: null, name: 'robert'})
    ];
    component.profileCardConfig = profileCardConfig();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doesnt show anything while dont have list', () => {
    component.list = null;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.switcher-wrapper'))).toBeFalsy();
  });

  it('shows list and pass variables there', () => {
    component.activeItem = '123';
    component.listItemWithLoader = '12345';
    component.showTopSwitcher = true;
    component.listTitle = 'title';
    component.list = [profileCard({logo: 'logo1.jpg', name: 'john'}),];
    fixture.detectChanges();
    const list = getComponent<PeSwitcherBusinessListComponent>(fixture, PeSwitcherBusinessListComponent);
    expect(list).toBeTruthy();
    expect(list.title).toBe(component.listTitle);
    expect(list.activeItem).toBe(component.activeItem);
    expect(list.opened).toBeTruthy();
    expect(list.list).toBe(component.list);
    expect(list.listItemWithLoader).toBe(component.listItemWithLoader);
  });
  it('emits onProfileFromListClick on onProfileClick emission from list', () => {
    let emittedProfile: PeProfileCardInterface = null;
    const expectedProfile = profileCard();
    component.onProfileFromListClick.subscribe((profile: PeProfileCardInterface) => emittedProfile = profile);
    const list = getComponent<PeSwitcherBusinessListComponent>(fixture, PeSwitcherBusinessListComponent);
    list.onProfileClick.emit(expectedProfile);
    expect(emittedProfile).toBe(expectedProfile);
  });

  it('shows profile switcher card and passes vars when showTopSwitcher - true and list not empty', () => {
    component.showTopSwitcher = true;
    component.list = [profileCard({logo: 'logo1.jpg', name: 'john'})];
    component.profileCardConfig = profileCardConfig();
    component.showTopSwitcherLoader = true;
    fixture.detectChanges();
    const card = getComponent<PeProfileCardComponent>(fixture, PeProfileCardComponent);
    expect(card.config).toBe(component.profileCardConfig);
    expect(card.showLoader).toBeTruthy();
  });

  it('applies switcher-wrapper-opened to wrapper when showTopSwitcher - true', () => {
    component.showTopSwitcher = true;
    fixture.detectChanges();
    let wrapper = fixture.debugElement.query(By.css('.switcher-wrapper'));
    expect(wrapper.classes['switcher-wrapper-opened']).toBeTruthy();
    expect(wrapper.classes['without-top-switcher']).toBeFalsy();
  });

  it('applies without-top-switcher to wrapper when showTopSwitcher - false', () => {
    component.showTopSwitcher = false;
    fixture.detectChanges();
    let wrapper = fixture.debugElement.query(By.css('.switcher-wrapper'));
    expect(wrapper.classes['switcher-wrapper-opened']).toBeFalsy();
    expect(wrapper.classes['without-top-switcher']).toBeTruthy();
  });

  it('emits onProfileCardClick on cardButtonClicked in profile card', () => {
    let emitted = false;
    component.onProfileCardClick.subscribe(() => emitted = true);
    component.showTopSwitcher = true;
    fixture.detectChanges();
    const card = getComponent<PeProfileCardComponent>(fixture, PeProfileCardComponent);
    card.cardButtonClicked.emit();
    expect(emitted).toBeTruthy();
  });

  it('applies without-top-switcher class to list when showTopSwitcher - false ', () => {
    component.showTopSwitcher = false;
    fixture.detectChanges();
    const listElement = fixture.debugElement.query(By.directive(PeSwitcherBusinessListComponent));
    expect(listElement.classes['without-top-switcher']).toBeTruthy();
  });

  it('pass showTopSwitcher as opened to list component', () => {
    component.showTopSwitcher = true;
    fixture.detectChanges();
    const list = getComponent<PeSwitcherBusinessListComponent>(fixture, PeSwitcherBusinessListComponent);
    expect(list.opened).toBeTruthy();
    component.showTopSwitcher = false;
    fixture.detectChanges();
    expect(list.opened).toBeFalsy();
  });
});

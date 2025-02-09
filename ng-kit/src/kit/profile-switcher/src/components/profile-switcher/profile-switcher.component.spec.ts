import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PeProfileCardComponent, PeSwitcherBusinessListComponent, PeSwitcherProfileListComponent} from '..';
import {PeProfileCardInterface} from '../../interfaces';
import {ProfileSwitcherModule} from '../../profile-switcher.module';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {getComponent, profileCard, profileCardConfig} from '../../profile-switcher-spec-helpers';

describe('ProfileSwitcherComponent', () => {
  let component: PeSwitcherProfileListComponent;
  let fixture: ComponentFixture<PeSwitcherProfileListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, MatCardModule, MatProgressSpinnerModule, NoopAnimationsModule, ProfileSwitcherModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeSwitcherProfileListComponent);
    component = fixture.componentInstance;
    component.personalProfileCardConfig = component.profileCardConfig = profileCardConfig();
    component.list = [profileCard()];
    component.showTopSwitcher = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('showTopSwitcher toggle profile-switcher-cards display', () => {
    component.showTopSwitcher = false;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.directive(PeProfileCardComponent)).length).toBe(0);
    expect(fixture.debugElement.query(By.css('.switcher-wrapper')).classes['without-top-switcher']).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(PeSwitcherBusinessListComponent)).classes['without-top-switcher']).toBeTruthy();

    component.showTopSwitcher = true;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.directive(PeProfileCardComponent)).length).toBe(2);
    expect(fixture.debugElement.query(By.css('.switcher-wrapper')).classes['without-top-switcher']).toBeFalsy();
    expect(fixture.debugElement.query(By.directive(PeSwitcherBusinessListComponent)).classes['without-top-switcher']).toBeFalsy();
  });

  it('hide personal profile widget when personal config missing', () => {
    component.personalProfileCardConfig = null;
    const businessProfile = component.profileCardConfig = profileCardConfig();
    fixture.detectChanges();
    const widgets = fixture.debugElement.queryAll(By.directive(PeProfileCardComponent));
    expect(widgets.length).toBe(1);
    expect(widgets[0].componentInstance.config).toBe(businessProfile);
  });

  it('hide business profile widget when list empty', () => {
    const config = component.personalProfileCardConfig = profileCardConfig();
    component.list = [];
    fixture.detectChanges();
    const widgets = fixture.debugElement.queryAll(By.directive(PeProfileCardComponent));
    expect(widgets.length).toBe(1);
    expect(widgets[0].componentInstance.config).toBe(config);
  });

  it('open list when dont show top switcher', () => {
    component.showTopSwitcher = false;
    fixture.detectChanges();
    const listComponent = getComponent<PeSwitcherBusinessListComponent>(fixture, PeSwitcherBusinessListComponent);
    expect(listComponent.opened).toBeTruthy();
  });

  it('toggle opened of list when business footer button clicked', () => {
    component.showTopSwitcher = true;
    // only business profile on screen
    component.personalProfileCardConfig = null;
    fixture.detectChanges();
    const profileCard = getComponent<PeProfileCardComponent>(fixture, PeProfileCardComponent);
    profileCard.footerButtonClicked.emit();
    fixture.detectChanges();

    const list = getComponent<PeSwitcherBusinessListComponent>(fixture, PeSwitcherBusinessListComponent);
    expect(list.opened).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.switcher-wrapper')).classes['switcher-wrapper-opened']).toBeTruthy();
  });

  it('passes showPersonalCardLoader to showLoader in personal', () => {
    component.list = [];
    component.showPersonalCardLoader = true;
    fixture.detectChanges();
    // only profile card on screen
    const profileCard = getComponent<PeProfileCardComponent>(fixture, PeProfileCardComponent);
    expect(profileCard.showLoader).toBeTruthy();

    component.showPersonalCardLoader = false;
    fixture.detectChanges();
    expect(profileCard.showLoader).toBeFalsy();
  });

  it('passes showBusinessCardLoader to showLoader in business', () => {
    component.personalProfileCardConfig = null;
    component.showBusinessCardLoader = true;
    fixture.detectChanges();
    // only business card on screen
    const profileCard = getComponent<PeProfileCardComponent>(fixture, PeProfileCardComponent);
    expect(profileCard.showLoader).toBeTruthy();
    component.showBusinessCardLoader = false;
    fixture.detectChanges();
    expect(profileCard.showLoader).toBeFalsy();
  });

  it('emits openPersonalProfile on cardButtonClicked in personal widget', () => {
    component.list = [];
    fixture.detectChanges();
    const profileCard = getComponent<PeProfileCardComponent>(fixture, PeProfileCardComponent);
    let emitted = false;
    component.openPersonalProfile.subscribe(() => emitted = true);
    profileCard.cardButtonClicked.emit();
    expect(emitted).toBeTruthy();
  });

  it('emits onProfileCardClick on cardButtonClicked in business widget', () => {
    let emitted = false;
    component.personalProfileCardConfig = null;
    fixture.detectChanges();
    // only business card on screen
    component.onProfileCardClick.subscribe(() => emitted = true);
    const profileCard = getComponent<PeProfileCardComponent>(fixture, PeProfileCardComponent);
    profileCard.cardButtonClicked.emit();
    expect(emitted).toBeTruthy();
  });

  it('emits onProfileFromListClick when onProfileClick in list occurs', () => {
    let emitted: PeProfileCardInterface = null;
    let profile = profileCard();
    component.onProfileFromListClick.subscribe((p: PeProfileCardInterface) => emitted = p);
    const list = getComponent<PeSwitcherBusinessListComponent>(fixture, PeSwitcherBusinessListComponent);
    list.onProfileClick.emit(profile);
    expect(emitted).toBe(profile);
  });

  it('passes list to list component', () => {
    const list = [profileCard()];
    const listItemWithLoader = '12345';
    const listTitle = 'list title';
    component.list = list;
    component.listItemWithLoader = listItemWithLoader;
    component.listTitle = listTitle;
    fixture.detectChanges();
    const listComponent = getComponent<PeSwitcherBusinessListComponent>(fixture, PeSwitcherBusinessListComponent);
    expect(listComponent.list).toBe(list);
    expect(listComponent.listItemWithLoader).toBe(listItemWithLoader);
    expect(listComponent.title).toBe(listTitle);
  });
});

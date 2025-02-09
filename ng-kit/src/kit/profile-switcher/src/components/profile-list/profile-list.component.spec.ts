import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {PeSwitcherBusinessListComponent, ProfileSpinnerComponent,} from '..';
import {ProfileMenuItemControlInterface, PeProfileCardInterface} from '../../interfaces';
import {ProfileControlType} from '../../interfaces';
import { AbbreviationPipe } from '../../../../common/src/pipes';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatMenuItem, MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DebugElement} from '@angular/core';
import {click, profileCard} from '../../profile-switcher-spec-helpers';

describe('ProfileListComponent', () => {
  let component: PeSwitcherBusinessListComponent;
  let fixture: ComponentFixture<PeSwitcherBusinessListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, MatCardModule, MatProgressSpinnerModule, NoopAnimationsModule],
      declarations: [PeSwitcherBusinessListComponent, AbbreviationPipe, ProfileSpinnerComponent],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeSwitcherBusinessListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switch opened when input set', () => {
    component.opened = true;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatCard)).classes.opened).toBeTruthy();

    component.opened = false;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatCard)).classes.opened).toBeFalsy();
  });

  it('show profile card list show logos', () => {
    component.list = [profileCard({logo: 'logo1.jpg'}), profileCard({logo: 'logo2.jpg'})];
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('img[src="logo1.jpg"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('img[src="logo2.jpg"]'))).toBeTruthy();
  });

  it('list dont show abbreviation names when have logos', () => {
    component.list = [profileCard({logo: 'logo1.jpg'}), profileCard({logo: 'logo2.jpg'})];
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('h2'))).toBeFalsy();
  });

  it('list show abbreviation names when have no logos', () => {
    component.list = [profileCard({logo: null, name: 'john'}), profileCard({logo: null, name: 'robert'})];
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('h2')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('h2'))[0].nativeElement.innerText).toBe(
      (new AbbreviationPipe).transform('john')
    );

    expect(fixture.debugElement.queryAll(By.css('h2'))[1].nativeElement.innerText).toBe(
      (new AbbreviationPipe).transform('robert')
    );
  });

  it('shows spinner when has listItemWithLoader', () => {
    component.list = [profileCard({name: 'john', uuid: '123'}), profileCard({name: 'robert'})];
    component.listItemWithLoader = '123';
    fixture.detectChanges();
    expect(
      fixture.debugElement
        .queryAll(By.css('.transparent-card'))[0]
        .query(By.directive(ProfileSpinnerComponent))
    ).toBeTruthy();

    expect(
      fixture.debugElement
        .queryAll(By.css('.transparent-card'))[1]
        .query(By.directive(ProfileSpinnerComponent))
    ).toBeFalsy();
  });

  it('shows full names under logos', () => {
    component.list = [
      profileCard({logo: 'logo1.jpg', name: 'john'}),
      profileCard({logo: null, name: 'robert'})
    ];
    fixture.detectChanges();
    expect(
      fixture.debugElement
        .queryAll(By.css('.transparent-card'))
        .filter(card => {
          return card.queryAll(By.css('p')).some(p => ['john', 'robert'].includes(p.nativeElement.innerText))
        })
        .length
    ).toBe(2);

  });

  it('handle button control click', () => {
    let clicked = false;
    const onClick = () => clicked = true;
    component.list = [profileCard({uuid: '123', leftControl: {type: ProfileControlType.Button, onClick: onClick}})];
    component.activeItem = '123';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.business-item')).query(By.css('button'));
    click(button);
    expect(clicked).toBeTruthy();
  });

  it('shows control menu items', () => {

    const clicked: boolean[] = [];
    const clickHandlers = [];
    const menuItems: ProfileMenuItemControlInterface[] = [];
    for (let i = 0; i < 2; i ++) {
      clicked[i] = false;
      clickHandlers[i] = () => clicked[i] = true;
      menuItems.push({
        title: `title ${i}`,
        onClick: clickHandlers[i]
      });
    }

    component.list = [profileCard({uuid: '123', leftControl: {type: ProfileControlType.Menu, menuItems}})];
    component.activeItem = '123';
    fixture.detectChanges();
    const menuTrigger = fixture.debugElement.query(By.css('.business-item')).query(By.css('button'));
    click(menuTrigger);
    fixture.detectChanges();
    const items = fixture.debugElement.query(By.css('.business-item')).queryAll(By.directive(MatMenuItem));
    expect(items.length).toBe(2);
    expect(items[0].nativeElement.innerHTML).toContain('title 0');
    expect(items[1].nativeElement.innerHTML).toContain('title 1');

    click(items[0]);
    expect(clicked[0]).toBeTruthy();
    click(items[1]);
    expect(clicked[1]).toBeTruthy();
  });

  it('emit profile click', () => {
    const profile = profileCard();
    component.list = [profile];
    fixture.detectChanges();
    let output: PeProfileCardInterface = null;
    component.onProfileClick.subscribe((p: PeProfileCardInterface) => output = p);
    click(fixture.debugElement.query(By.css('.transparent-card')));
    expect(output).toBe(profile);
  });

});

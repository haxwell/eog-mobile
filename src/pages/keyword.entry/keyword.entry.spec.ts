import { async, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { KeywordEntryPage } from './keyword.entry';
import {
  PlatformMock,
  SplashScreenMock,
  ViewControllerMock
} from '../../../test-config/mocks-ionic';

import { StatusBarMock } from 'ionic-mocks'

describe('KeywordEntryPage Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KeywordEntryPage],
      imports: [
        IonicModule.forRoot(KeywordEntryPage)
      ],
      providers: [
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock },
        { provide: ViewController, useClass: ViewControllerMock }
      ]
    })
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeywordEntryPage);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component instanceof KeywordEntryPage).toBe(true);
  });

  it('should not have save button enabled', () => {
    expect(component.keywordString).toBe(undefined);
    expect(component.isSaveBtnEnabled()).toBe(false);
  });

  it('should break down a comma delimited string correctly', () => {
    component.keywordString = "testing,1,2,3";
    expect(component.keywordString).toBe("testing,1,2,3");
    expect(component.onSaveBtnTap(null)).toContain("2");
    expect(component.onSaveBtnTap(null)).toContain("1");
  });

  it('should break down a single-value string correctly', () => {
    component.keywordString = "testing1.2.3";
    expect(component.keywordString).toBe("testing1.2.3");
    expect(component.onSaveBtnTap(null)).toContain("testing1.2.3");

    component.keywordString = "testing1 2 3";
    expect(component.keywordString).toBe("testing1 2 3");
    expect(component.onSaveBtnTap(null)).toContain("testing1 2 3");
  });

});

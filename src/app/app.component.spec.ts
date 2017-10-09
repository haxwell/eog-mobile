import { async, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { EasyahApp } from './app.component';
import {
  PlatformMock,
  StatusBarMock,
  SplashScreenMock
} from '../../test-config/mocks-ionic';

describe('EasyahApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EasyahApp],
      imports: [
        IonicModule.forRoot(EasyahApp)
      ],
      providers: [
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock }
      ]
    })
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EasyahApp);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component instanceof EasyahApp).toBe(true);
  });

});

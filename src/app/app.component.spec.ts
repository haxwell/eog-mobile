import { async, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { EasyahApp } from './app.component';
import { ProfileHeader } from '../pages/common/profile-header/profile-header';
import { ProfilePoints } from '../pages/common/profile-points/profile-points';

import { ApiService } from './_services/api.service';
import { Constants } from '../_constants/constants';
import { DeclineReasonCodeService } from './_services/declined-reason-codes.service';
import { NotificationService } from './_services/notification.service';
import { PointsService } from './_services/points.service';
import { ProfileService } from '../pages/common/_services/profile.service';
import { ProfilePictureService } from './_services/profile-picture.service';
import { RecommendationService } from './_services/recommendation.service';
import { RequestsService } from './_services/requests.service';
import { SearchService } from './_services/search.service';
import { UnseenChangesIndicatorService } from './_services/unseen-changes-indicator.service';
import { UserService } from './_services/user.service';
import { UserPreferencesService } from './_services/user-preferences.service';
import { WebsocketService } from './_services/websocket.service';

import {
  PlatformMock,
  StatusBarMock,
  SplashScreenMock
} from '../../test-config/mocks-ionic';

import {
  ApiServiceMock,
  UserServiceMock,
  ProfilePictureServiceMock
} from '../../test-config/mocks-easyah';

describe('EasyahApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EasyahApp, ProfileHeader, ProfilePoints],
      imports: [
        IonicModule.forRoot(EasyahApp)
      ],
      providers: [
        { provide: ApiService, useClass: ApiServiceMock },
        Constants,
        DeclineReasonCodeService,
        PointsService,
        ProfileService,
        { provide: ProfilePictureService, useClass: ProfilePictureServiceMock },
        RecommendationService,
        RequestsService,
        SearchService,
        UnseenChangesIndicatorService,
        { provide: UserService, useClass: UserServiceMock },
        UserPreferencesService,
        WebsocketService,

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

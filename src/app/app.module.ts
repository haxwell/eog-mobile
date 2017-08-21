import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';

import { LocalStorageModule } from 'angular-2-local-storage';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';
import { SearchPage } from '../pages/search/search';
import { RequestPage } from '../pages/search/_pages/request';
import { AcceptRequestPage } from '../pages/requests/incoming/_pages/accept.request';
import { DeclineRequestPage } from '../pages/requests/incoming/_pages/decline.request';
import { CancelRequestPage } from '../pages/requests/incoming/_pages/cancel.request';
import { CompleteRequestPage } from '../pages/requests/incoming/_pages/complete.request';
import { CompleteOutgoingRequestPage } from '../pages/requests/outgoing/_pages/complete.request';
import { NotCompleteOutgoingRequestPage } from '../pages/requests/outgoing/_pages/not.complete.request';
import { CancelOutgoingRequestPage } from '../pages/requests/outgoing/_pages/cancel.request';
import { RequestContactInfoPage } from '../pages/requests/_pages/contact.info';
import { DreamPage } from '../pages/dreams/dreams';
import { ThingPage } from '../pages/things/things';
import { RequestsIncomingPage } from '../pages/requests/incoming/requests.incoming';
import { RequestsOutgoingPage } from '../pages/requests/outgoing/requests.outgoing';
import { RulePage } from '../pages/things/_pages/rule';

import { ApiService } from './_services/api.service';
import { UserService } from './_services/user.service';
import { DreamService } from './_services/dream.service';
import { SearchService } from './_services/search.service';
import { PointsService } from './_services/points.service';
import { RecommendationService } from './_services/recommendation.service';
import { RequestsService } from './_services/requests.service';
import { ProfileService } from '../pages/profile/_services/profile.service';
import { ThingService } from '../pages/things/_services/thing.service';
import { RuleService } from '../pages/things/_pages/_services/rule.service';


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    ProfilePage,
    DreamPage,
    ThingPage,
    RulePage,
    RequestsIncomingPage,
    RequestsOutgoingPage,
    RequestPage,
    AcceptRequestPage,
    DeclineRequestPage,
    CancelRequestPage,
    CompleteRequestPage,
    CompleteOutgoingRequestPage,
    NotCompleteOutgoingRequestPage,
    CancelOutgoingRequestPage,
    RequestContactInfoPage,
    SearchPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    LocalStorageModule.withConfig({
        prefix: 'eog-app',
        storageType: 'localStorage'
    }),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    ProfilePage,
    DreamPage,
    ThingPage,
    RulePage,
    RequestsIncomingPage,
    RequestsOutgoingPage,
    RequestPage,
    AcceptRequestPage,
    DeclineRequestPage,
    CancelRequestPage,
    CompleteRequestPage,
    CompleteOutgoingRequestPage,
    NotCompleteOutgoingRequestPage,
    CancelOutgoingRequestPage,
    RequestContactInfoPage,
    SearchPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ApiService,
    UserService,
    RuleService, // TODO: Can be Deleted?
    PointsService,
    SearchService,
    DreamService,
    ThingService,
    ProfileService,
    RequestsService,
    RecommendationService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}

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
import { RequestsIncomingPage } from '../pages/requests/incoming/requests.incoming';
import { RequestsOutgoingPage } from '../pages/requests/outgoing/requests.outgoing';

import { ApiService } from './_services/api.service';
import { UserService } from './_services/user.service';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    ProfilePage,
    RequestsIncomingPage,
    RequestsOutgoingPage
   , SearchPage
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
    RequestsIncomingPage,
    RequestsOutgoingPage
    ,SearchPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ApiService,
    UserService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}

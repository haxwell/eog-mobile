import { Component, ViewChild } from '@angular/core';

import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { UserService } from './_services/user.service';
import { UserPreferencesService } from './_services/user-preferences.service';
import { WebsocketService } from './_services/websocket.service';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { RequestsOutgoingView } from '../pages/common/requests-outgoing/requests-outgoing';
import { RequestsIncomingView } from '../pages/common/requests-incoming/requests-incoming';
import { PromiseListPage } from '../pages/promise-list/promise-list';
import { KeywordListPage } from '../pages/keyword-list/keyword-list';
import { RecommendationListPage } from '../pages/recommendation-list/recommendation-list';
import { NotificationListPage } from '../pages/notification-list/notification-list';
import { ProfilePage } from '../pages/profile/profile';

@Component({
  templateUrl: 'app.html'
})
export class EasyahApp {
  rootPage:any = LoginPage;
  lastTimeBackPress = 0;
  timePeriodToExit = 750;

  @ViewChild(Nav) navCtrl: Nav;

  constructor(platform: Platform,
              statusBar: StatusBar,
              private websocketService: WebsocketService,
              private _userPreferencesService: UserPreferencesService,
              private _userService : UserService,
              private _menuCtrl : MenuController) {

    //let self = this;

/*
    platform.registerBackButtonAction(() => {
          // get current active page
          let view = self.navCtrl.getActive();

          if (view.component.name == "HomePage") {
              // press Back twice to logout..
              if (new Date().getTime() - self.lastTimeBackPress < self.timePeriodToExit) {
                  self.navCtrl.pop();
              } else {
                  self.lastTimeBackPress = new Date().getTime();
              }
          } else if (view.component.name == "LoginPage") {
              // press Back twice again to exit the app..
              if (new Date().getTime() - self.lastTimeBackPress < self.timePeriodToExit) {
                  platform.exitApp();
              } else {
                  self.lastTimeBackPress = new Date().getTime();
              }
          } else {
              // go to previous page
              self.navCtrl.pop({});
          }
      });
*/

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
    });
  
  }

  getUser() {
    // this is called from the template
    return this._userService.getCurrentUser();
  }

  onHomeClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "HomePage") {
      this.onCloseMenuClicked();
      this.navCtrl.push(HomePage, {});
    }
  }

  onShowProfile() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "ProfilePage") {
      this.onCloseMenuClicked();
      this.navCtrl.push(ProfilePage, {user: this._userService.getCurrentUser()});
    }
  }

  onYouAskedPeopleClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "RequestsOutgoingView") {
      this.onCloseMenuClicked();
      this.navCtrl.push(RequestsOutgoingView, {});
    }
  }

  onPeopleAskedYouClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "RequestsIncomingView") {
      this.onCloseMenuClicked();
      this.navCtrl.push(RequestsIncomingView, {});
    }
  }

  onYourPromisesClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "PromiseListPage") {
      this.onCloseMenuClicked();
      this.navCtrl.push(PromiseListPage, {});
    }
  }

  onYourRecommendationsClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "RecommendationListPage") {
      this.onCloseMenuClicked();
      this.navCtrl.push(RecommendationListPage, {});
    }
  }

  onYourKeywordsClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "KeywordListPage") {
      this.onCloseMenuClicked();
      this.navCtrl.push(KeywordListPage, {});
    }
  }

  onYourNotificationsClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "NotificationListPage") {
      this.onCloseMenuClicked();
      this.navCtrl.push(NotificationListPage, {});
    }
  }

  onCloseMenuClicked() {
    this._menuCtrl.close();
  }

  getSelectedColor(pageName) {
    var view = this.navCtrl.getActive();
    if (view && view.component.name == pageName) {
      return "lightgrey";
    } else {
      return "white"
    }
  }

}


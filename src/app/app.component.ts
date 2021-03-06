import { Component, ViewChild } from '@angular/core';

import { Platform, Nav, MenuController, AlertController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { UserService } from './_services/user.service';
import { WebsocketService } from './_services/websocket.service';
import { UserPreferencesService } from './_services/user-preferences.service';
import { UnseenChangesIndicatorService } from './_services/unseen-changes-indicator.service';

import { LoginPage } from '../pages/login/login';
import { AboutEasyahPage } from '../pages/about-easyah/about-easyah';
import { HomePage } from '../pages/home/home';
import { RequestsOutgoingView } from '../pages/common/requests-outgoing/requests-outgoing';
import { RequestsIncomingView } from '../pages/common/requests-incoming/requests-incoming';
import { OfferListPage } from '../pages/offer-list/offer-list';
import { KeywordListPage } from '../pages/keyword-list/keyword-list';
import { RecommendationListPage } from '../pages/recommendation-list/recommendation-list';
import { NotificationListPage } from '../pages/notification-list/notification-list';
import { ProfilePage } from '../pages/profile/profile';

@Component({
  templateUrl: 'app.html'
})
export class EasyahApp {
  rootPage:any = LoginPage;
  exitFunction = undefined;  
  isAndroidFunction = undefined;
  _isLoggedIn = false;

  @ViewChild(Nav) navCtrl: Nav;

  constructor(platform: Platform,
              statusBar: StatusBar,
              websocketService: WebsocketService, // defined here so it will be initialized, but not used in this class
              userPreferencesService : UserPreferencesService, // defined here so it will be initialized, but not used in this class
              private _userService : UserService,
              private _menuCtrl : MenuController,
              private _alertCtrl: AlertController,
              private _uciService: UnseenChangesIndicatorService, 
              private _events: Events
  ) {

    this._events.subscribe('app:login', (currentUser) => { this._isLoggedIn = true; })

    this.exitFunction = () => {
      platform.exitApp();
    }

    this.isAndroidFunction = () => {
      return platform.is('android');
    }

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
    });
  
  }

  isMenuCoolToShow() {
    return this._isLoggedIn && this.navCtrl.length() > 1;
  }

  getUser() {
    // this is called from the template
    return this._userService.getCurrentUser();
  }

  onHomeClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "HomePage") {
      this._menuCtrl.close();
      this.navCtrl.push(HomePage, {});
    }
  }

  onShowProfile() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "ProfilePage") {
      this._menuCtrl.close();
      this.navCtrl.push(ProfilePage, {userId: this._userService.getCurrentUser()["id"]});
    }
  }

  onYouAskedPeopleClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "RequestsOutgoingView") {
      this._menuCtrl.close();
      this._uciService.resetOutgoingUnseenChanges();
      this.navCtrl.push(RequestsOutgoingView, {});
    }
  }

  onPeopleAskedYouClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "RequestsIncomingView") {
      this._menuCtrl.close();
      this._uciService.resetIncomingUnseenChanges();
      this.navCtrl.push(RequestsIncomingView, {});
    }
  }

  onYourOffersClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "OfferListPage") {
      this._menuCtrl.close();
      this.navCtrl.push(OfferListPage, {});
    }
  }

  onYourRecommendationsClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "RecommendationListPage") {
      this._menuCtrl.close();
      this.navCtrl.push(RecommendationListPage, {});
    }
  }

  onYourKeywordsClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "KeywordListPage") {
      this._menuCtrl.close();
      this.navCtrl.push(KeywordListPage, {});
    }
  }

  onYourNotificationsClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "NotificationListPage") {
      this._menuCtrl.close();
      this._uciService.resetNotificationUnseenChanges();
      this.navCtrl.push(NotificationListPage, {});
    }
  }

  onAboutEasyahClicked() {
    var view = this.navCtrl.getActive();
    if (view.component.name != "AboutEasyahPage") {
      this._menuCtrl.close();
      this.navCtrl.push(AboutEasyahPage, {});
    }
  }

  isLogoutBtnVisible() {
    return this.isAndroidFunction();
  }

  onLogoutBtnClick() {
    let confirmAlert = this._alertCtrl.create({
      title: 'Exit Easyah?',
      message: "Sure you want to exit the app?",
      buttons: [{
        text: "No, I'll stay.",
        role: 'cancel'
      }, {
        text: 'Yes, exit!',
        handler: () => {
          this.exitFunction();
        }
      }]
    });
    confirmAlert.present();
  }

  getSelectedColor(pageName) {
    var view = this.navCtrl.getActive();
    if (view && view.component.name == pageName) {
      return "lightgrey";
    } else {
      return "white"
    }
  }

  areIncomingUnseenChanges() {
    return this._uciService.areIncomingUnseenChanges();
  }

  areOutgoingUnseenChanges() {
    return this._uciService.areOutgoingUnseenChanges();
  }

  areNotificationUnseenChanges() {
    return this._uciService.areNotificationUnseenChanges();
  }

}


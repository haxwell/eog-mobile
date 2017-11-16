import { Component, ViewChild } from '@angular/core';

import { Platform, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class EasyahApp {
  rootPage:any = LoginPage;
  lastTimeBackPress = 0;
  timePeriodToExit = 750;

  @ViewChild(Nav) navCtrl: Nav;

  constructor(platform: Platform,
              statusBar: StatusBar) {

    let self = this;
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
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
    });
  
  }

}


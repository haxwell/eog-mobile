import { Component } from '@angular/core';

import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class EasyahApp {
  rootPage:any = LoginPage;

  constructor(platform: Platform,
              _events: Events, 
              statusBar: StatusBar) {

    platform.registerBackButtonAction(() => {
        _events.publish("hardwareBackButtonPressed", { });
    });
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
    });
  
  }

}


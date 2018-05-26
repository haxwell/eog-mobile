import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../home/home';
import { CreateAccountPage } from './_pages/create.account'

import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

//  user = {id:-1, name: 'eogadmin', password: 'password'};
  user = {id:-1, name: '', password: ''};
  loading = undefined;
  
  constructor(public navCtrl: NavController,
              private _alertCtrl: AlertController,
              private _userService: UserService,
              private loadingCtrl: LoadingController,
              private splashScreen: SplashScreen,
              private _events: Events) {

  }

  ionViewWillEnter() {
      this.splashScreen.hide();
  }

  onLoginBtnTap(event) {
    let self = this;
    self.loading = self.loadingCtrl.create({
      content: 'Please wait...'
    })

    self.loading.present();

    this._userService.verifyAndLoginUser(this.user.name, this.user.password).then((userObj) => {
      let pw = self.user.password;
      let un = self.user.name;

      self.user = userObj;
      
      self.user["password"] = pw;
      self.user["name"] = un;

      self._events.publish("app:login", userObj);

      self.loading.dismiss();
      this.navCtrl.push(HomePage);


    }, 
    (err) => {
        self.loading.dismiss();
        let okAlert = self._alertCtrl.create({
                title: 'Sad face..',
                subTitle: "Bad username/password!",
                buttons: [{
                  text: 'OK',
                  handler: () => { }
                }]
              })

        okAlert.present();
    });
  }

  onCreateAccountBtnTap(event) {
    this.navCtrl.push(CreateAccountPage);
  }

}

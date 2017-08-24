import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocalStorageService } from 'angular-2-local-storage';

import { HomePage } from '../home/home';
import { CreateAccountPage } from './_pages/create.account'

import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  user = {id:-1, name: 'eogadmin', password: 'password'};
  
  constructor(public navCtrl: NavController,
              private _userService: UserService,
              private _localStorageService: LocalStorageService) {

  }

  onLoginBtnTap(event) {
    let self = this;

    this._userService.verifyAndLoginUser(this.user.name, this.user.password).then((userObj) => {
      let pw = self.user.password;
      let un = self.user.name;

      self.user = userObj;
      
      self.user["password"] = pw;
      self.user["name"] = un;

      self._localStorageService.set('user', self.user);

      this.navCtrl.push(HomePage);
    });
  }

  onCreateAccountBtnTap(event) {
    this.navCtrl.push(CreateAccountPage);
  }

}

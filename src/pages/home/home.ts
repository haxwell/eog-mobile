import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';
import { SearchUsersPage } from '../searchUsers/searchUsers';
import { RequestsIncomingPage } from '../requests/incoming/requests.incoming';
import { RequestsOutgoingPage } from '../requests/outgoing/requests.outgoing';

import { ProfileHeader } from '../../pages/common/profile-header/profile-header'

import { UserService } from '../../app/_services/user.service'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  user = undefined;

  constructor(public navCtrl: NavController, private _userService: UserService) {

  }

  ngOnInit() {
    this.user = this._userService.getCurrentUser();
  }

  onProfileBtnTap(event) {
  	this.navCtrl.push(ProfilePage, {user: this.user, readOnly: false});
  }

  onSearchForUsersBtnTap(event) {
    this.navCtrl.push(SearchUsersPage);
  }

  onSearchForPromisesBtnTap(event) {
    this.navCtrl.push(SearchPage);
  }

  onIncomingReqBtnTap(event) {
  	this.navCtrl.push(RequestsIncomingPage);
  }

  onOutgoingReqBtnTap(event) {
  	this.navCtrl.push(RequestsOutgoingPage);
  }

  getUser() {
    return this.user;
  }

}

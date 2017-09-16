import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';
import { SearchUsersPage } from '../searchUsers/searchUsers';
import { RequestsIncomingView } from '../../pages/common/requests-incoming/requests-incoming';
import { RequestsOutgoingPage } from '../requests/outgoing/requests.outgoing';

import { ProfileHeader } from '../../pages/common/profile-header/profile-header'

import { UserService } from '../../app/_services/user.service'
import { SearchService } from '../../app/_services/search.service'

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    user = undefined;
    searchPhrase = undefined;
    _isSearchFieldVisible = false;
    items = {};

    constructor(public navCtrl: NavController, private _userService: UserService, private _searchService: SearchService) {

    }

    ngOnInit() {
        this.user = this._userService.getCurrentUser();
    }

  initializeItems(query) {
        let self = this;

        return new Promise((resolve, reject) => {
            let rtn = {};

            self._searchService.searchPrms(query).then((data: Array<Object>) => {
                data.map((obj) => {
                    self._userService.getUser(obj["userId"]).then((user) => {
                        obj["directionallyOppositeUser"] = user;
                        delete obj["userId"];

                        if (!data.some((obj) => { return obj["userId"] != undefined; })) {
                          rtn["prms"] = data;

                          if (rtn["users"] !== undefined)
                              resolve(rtn);
                        }
                    });
                });
            });

            self._searchService.searchUsers(query).then((data: Array<Object>) => {
                rtn["users"] = data;

                if (rtn["prms"] !== undefined)
                    resolve(rtn);
            });

        });
  }

  executeQuery(evt) {
      this.initializeItems(evt.target.value).then((data) => {
          this.items = data;
      });
  }

  getResults() {
      return this.items["prms"];
  }

  isSearchFieldVisible() {
    return this._isSearchFieldVisible;
  }

  isSearchFieldDisabled() {
    return false;
  }

  onSearchBtnTap(event) {
    this.setIsSearchFieldVisible(!this.isSearchFieldVisible());
  }

  setIsSearchFieldVisible(b) {
    this._isSearchFieldVisible = b;
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
  	//this.navCtrl.push(RequestsIncomingPage);
  }

  onOutgoingReqBtnTap(event) {
  	this.navCtrl.push(RequestsOutgoingPage);
  }

  getUser() {
    return this.user;
  }

}

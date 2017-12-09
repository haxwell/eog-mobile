import { Component, ViewChild } from '@angular/core';
import { NavController, Navbar, Events, ModalController, AlertController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';
import { SearchUsersPage } from '../searchUsers/searchUsers';
import { PrmPage } from '../promises/promises'
import { TutorialPage } from '../tutorial/tutorial'

import { UserService } from '../../app/_services/user.service'
import { SearchService } from '../../app/_services/search.service'
import { PrmMetadataService } from '../../app/_services/prm-metadata.service';

import { Constants } from '../../_constants/constants';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild(Navbar) navBar: Navbar;

    user = undefined;
    searchPhrase = undefined;
    _isSearchFieldVisible = false;
    items = {};
    showTutorialPromise = undefined;
    _mapPrmIdToMetadataValue = {};
    isVerifyLogoutAlertVisible = false;
    isHomePageVisible = true;

    constructor(public navCtrl: NavController,
                private _modalCtrl: ModalController, 
                private _alertCtrl: AlertController,
                private _userService: UserService, 
                private _searchService: SearchService, 
                private _prmMetadataService: PrmMetadataService,
                private _constants: Constants,
                private _events: Events) {

        this._events.subscribe('hardwareBackButtonPressed', () => { this.verifyLogout(); });

        this._events.subscribe('request:saved', (request) => {
            this.ngOnInit();
        });
    }

    ngOnInit() {
        this.user = this._userService.getCurrentUser();
        this.showTutorialPromise = this._userService.getShowTutorialOnLogin();

        this._prmMetadataService.reset();
        this._prmMetadataService.init();

        this._mapPrmIdToMetadataValue = {};
    }

    ionViewWillEnter() {
        let self = this;
        if (self.showTutorialPromise !== undefined && self._userService.getTutorialHasBeenShown() !== true) {
            self.showTutorialPromise.then((b) => {
                if (b === true) {
                    let modal = self._modalCtrl.create(TutorialPage, { });
                  
                    modal.onDidDismiss((data) => { 
                      self._userService.setTutorialHasBeenShown(true);
                    });

                    modal.present();
                }
            });
        }

        self.navBar.backButtonClick = () => { self.verifyLogout(); };

        this.isHomePageVisible = true;
    }

    ionViewDidLeave() {
        this.isHomePageVisible = false;
    }

    verifyLogout() {

      if (this.isHomePageVisible) {
        let self = this;
        let alert = self._alertCtrl.create({
          title: 'Log out?',
          message: 'Do you want to log out?',
          buttons: [
            {
              text: 'No', role: 'cancel', handler: () => {
                // do nothing
            },
            }, {
                text: 'Yes', handler: () => {
                  self.navCtrl.pop();
              }
            }
          ]
        });

        alert.present();
      }
    }

    initializeItems(query) {
        let self = this;

        /* Return a promise which calls for both User and Prm results*/

        return new Promise((resolve, reject) => {
            let rtn = {};

            self._searchService.searchPrms(query).then((data: Array<Object>) => {
                
                if (data === undefined || data.length === 0)
                  rtn["prms"] = data;
                else data.map((obj) => {
                    
                    /* Calculate who's the user on the other side.. */

                    let getUserPromise = self._userService.getUser(obj["userId"]);
                    getUserPromise.then((user) => {
                        obj["directionallyOppositeUser"] = user;
                        delete obj["userId"];

                        // if there are no prms with a valid userId property.. (cause we're deleting them..)
                        if (!data.some((obj) => { return obj["userId"] != undefined; })) {
                          
                          // then we're done setting DOU on each promise..
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
      if (evt.target.value.length > 2)
          this.initializeItems(evt.target.value).then((data) => {
              this.items = data;
          });
  }

  getResults() {
      let uList = this.items["users"] || [];
      let pList = this.items["prms"] || [];

      return pList.concat(uList);
  }

  arePrmResultsAvailable() {
      return this.items !== undefined && this.items["prms"] !== undefined && this.items["prms"].length > 0;
  }

  areUserResultsAvailable() {
      return this.items != undefined && this.items["users"] !== undefined && this.items["users"].length > 0;
  }

  getPrmResults() {
      if (this.arePrmResultsAvailable())
        return this.items["prms"];
      else
        return [];
  }

  getUserResults() {
      if (this.areUserResultsAvailable())
          return this.items["users"];
      else
          return [];
  }

  onPrmResultTap(_prm) {
      this.navCtrl.push(PrmPage, { prm: _prm, readOnly: true });
      this.setIsSearchFieldVisible(false);
  }

  onUserResultTap(_user) {
      this.navCtrl.push(ProfilePage, { user: _user, readOnly: true });
      this.setIsSearchFieldVisible(false);
  }

  onShowProfile() {
      this.navCtrl.push(ProfilePage, { user: this.user, readOnly: false });
      this.setIsSearchFieldVisible(false);
  }

  isSearchFieldVisible() {
    return this._isSearchFieldVisible;
  }

  isSearchFieldDisabled() {
    return false;
  }

  onSearchBtnTap(event) {
      this.navCtrl.push(SearchPage, { });
  }

  setIsSearchFieldVisible(b) {
    this._isSearchFieldVisible = b;

    if (!this.isSearchFieldVisible()) {
      this.items = undefined;
    }
  }

  onSearchForUsersBtnTap(event) {
    this.navCtrl.push(SearchUsersPage);
  }

  onSearchForPrmsBtnTap(event) {
    this.navCtrl.push(SearchPage);
  }

  getUser() {
    return this.user;
  }

  getMetadataValue(prm, functionKey, rtnFunction) {
      if (this._mapPrmIdToMetadataValue[prm["id"]] === undefined)
          this._mapPrmIdToMetadataValue[prm["id"]] = [];

      if (this._mapPrmIdToMetadataValue[prm["id"]][functionKey] === undefined) {
          this._mapPrmIdToMetadataValue[prm["id"]][functionKey] = null;

          this._prmMetadataService.getMetadataValue(prm, functionKey).then((bool) => {
              this._mapPrmIdToMetadataValue[prm["id"]][functionKey] = bool;
          })
      }

      return rtnFunction(this._mapPrmIdToMetadataValue[prm["id"]][functionKey]);
  }

  hasPrmBeenPreviouslyRequested(prm) {
      return this.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_PRM, (rtn) => { return rtn === true;} );
  }

  areRecommendationsRequired(prm) {
      return this.getMetadataValue(prm, this._constants.FUNCTION_KEY_PRM_REQUIRES_RECOMMENDATIONS, (rtn) => { return rtn === true;} );
  }

  getNecessaryRecommendationsIconColor(prm) {
      return this.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS, (rtn) => { return rtn === true ? "green" : "red";} );
  }

  getAlreadyRequestedIconColor(prm) {
      return this.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM, (rtn) => { return rtn === true ? "red" : "green";} );      
  }

  getSufficientTimeIconColor(prm) {
      return this.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE, (rtn) => { return rtn === true ? "green" : "red";} );      
  }

  getSufficientPointsIconColor(prm) {
      return this.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS, (rtn) => { return rtn === true ? "green" : "red";} );      
  }

}

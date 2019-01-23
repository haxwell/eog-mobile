import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { Constants } from '../../_constants/constants'

import { ProfilePage } from '../profile/profile'

import { SearchService } from '../../app/_services/search.service';
import { PictureService } from '../../app/_services/picture.service';
import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = '';
	offerResults = undefined;
	usersResults = undefined;
	loading = undefined;
	loadingDismissed = false;

	constructor(navParams: NavParams,
				public navCtrl: NavController,
				private _searchService: SearchService,
				private _pictureService: PictureService,
				private _userService: UserService,
				private loadingCtrl: LoadingController,
				private _constants: Constants,
				_events: Events) {

		this.searchString = navParams.get('searchString') || '';
	}

	ngOnInit() {

	}

	ionViewWillEnter() {
		this.onSearchBtnTap();
	}

	onSearchBtnTap(evt?) {
		let self = this;

		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();

		this.usersResults = undefined;
		this.offerResults = undefined;

		let count = 0;
		let func = () => {
			count++;
			if (count >= 2)
				self.loading.dismiss();
		};

		let user = self._userService.getCurrentUser();
		let distance = 50; // TODO: Add a drop down where the user can select a distance.

		this._searchService.searchOffers(this.searchString, distance, user["id"]).then((data: Array<Object>) => {

			if (data.length === 0) {
				self.offerResults = data;

				func();

			} else {
				data.map((obj) => {
					self._userService.getUser(obj["userId"]).then((user) => {
						obj["directionallyOppositeUser"] = user;
						delete obj["userId"];

						if (!data.some((obj) => { return obj["userId"] != undefined; })) {
							self.offerResults = data;
							func();
						}
					});
				});
			}
		});

		this._searchService.searchUsers(this.searchString).then((data: Array<Object>) => {
			self.usersResults = data;
			func();
		});
	}

	onQueryChanged(event) {
		this.searchString = event._value;
	}

	getOfferResults() {
		return this.offerResults;
	}

	isUsersResultsEmpty() {
		// TODO: Create Utility for this, duplicate code in other-peoples-offer-list.ts
		let rtn = this.usersResults == undefined || this.usersResults == null || this.usersResults.length == 0;
		return rtn;
	}

	getUsersResults() {
		if (this.usersResults !== undefined) {
			let currentUser = this._userService.getCurrentUser();
			return this.usersResults.filter((o) => { return o["id"] !== currentUser["id"]; });
		} else {
			return this.usersResults;
		}
	}

	profileImageFilepath = [];
	getProfileImageFilepath(user) {
		return this.profileImageFilepath[user["id"]];
	}

	isProfileImageAvailable(user) {
		let rtn = this.profileImageFilepath[user["id"]] !== undefined && this.profileImageFilepath[user["id"]] !== null;

		let self = this;
		if (this.profileImageFilepath[user["id"]] === undefined) {
			this.profileImageFilepath[user["id"]] = null;

			self._pictureService.get(this._constants.PHOTO_TYPE_PROFILE, user["id"]).then((path) => {
				if (path !== undefined)
					self.profileImageFilepath[user["id"]] = path;
			});
		}

		return rtn; 
	}

	onViewUser(_user) {
		this.navCtrl.push(ProfilePage, {user: _user});
	}
}

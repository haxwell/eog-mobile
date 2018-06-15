import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { Constants } from '../../_constants/constants'

import { PrmDisplayPage } from '../promises/display.prm'
import { ProfilePage } from '../profile/profile'

import { SearchService } from '../../app/_services/search.service';
import { ProfileService } from '../common/_services/profile.service';
import { ProfilePictureService } from '../../app/_services/profile-picture.service';
import { PrmMetadataService } from '../../app/_services/prm-metadata.service';
import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = '';
	prmResults = undefined;
	usersResults = undefined;
	loading = undefined;
	loadingDismissed = false;

	constructor(navParams: NavParams,
				public navCtrl: NavController,
				private _searchService: SearchService,
				private _profileService: ProfileService,
				private _profilePictureService: ProfilePictureService,
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

		self.loadingDismissed = false;
		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.onDidDismiss(() => {
			self.loadingDismissed = true;
		})

		self.loading.present();

		this.usersResults = undefined;
		this.prmResults = undefined;

		this._searchService.searchPrms(this.searchString).then((data: Array<Object>) => {

			if (data.length === 0) {
				self.prmResults = data;

				if (self.usersResults !== undefined)
					self.loading.dismiss();
			} else {
				data.map((obj) => {
					self._userService.getUser(obj["userId"]).then((user) => {
						obj["directionallyOppositeUser"] = user;
						delete obj["userId"];

						if (!data.some((obj) => { return obj["userId"] != undefined; })) {
							self.prmResults = data;
						}
					});
				});

				if (self.usersResults && !self.loadingDismissed) {
					self.loading.dismiss();
				}
			}
		});

		this._searchService.searchUsers(this.searchString).then((data: Array<Object>) => {
			self.usersResults = data;

			if (self.prmResults && !self.loadingDismissed) {
				self.loading.dismiss();
			}
		});
	}

	onQueryChanged(event) {
		this.searchString = event._value;
	}

	getPromiseResults() {
		return this.prmResults;
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

			let path = self._profileService.getMostProbableProfilePhotoPath(user["id"]);

			console.log("No Profile Image loaded for user Id " + user["id"] + ". Trying to find one... " + path);			
			
			self._profilePictureService.get(this._constants.PHOTO_TYPE_PROFILE, user["id"], path).then((path) => {
				if (path !== undefined)
					self.profileImageFilepath[user["id"]] = path;
			});
		}

		return rtn; 
	}

	onViewUser(user) {
		this.navCtrl.push(ProfilePage, {user: user});
	}
}

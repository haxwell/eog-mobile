import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { SendPointPage } from './_pages/send.point.page'
import { SendRecommendPage } from './_pages/send.recommend.page'
import { ProfilePage } from '../../pages/profile/profile'

import { UserService } from '../../app/_services/user.service';
import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';
import { RecommendationService } from '../../app/_services/recommendation.service';

@Component({
  selector: 'page-search-users',
  templateUrl: 'searchUsers.html'
})
export class SearchUsersPage {
	searchString = '';
	resultList = undefined;

	isPointableObj = {};
	isRecommendableObj = {};

	userSearchResultsPromise = undefined;
	loading = undefined;

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService,
				private _userService: UserService,
				private loadingCtrl: LoadingController) {

	}

	ngOnInit() {
		this.isPointableObj = {};
		this.isRecommendableObj = {};

		this._recommendationService.init();
		this._pointsService.init();
	}

	thumbnailImages = {};
	setThumbnailImageForUser(user) {
		let self = this;
		self._userService.getThumbnailImageForUser(user).then((base64ImageStr) => {
			self.thumbnailImages[user["id"]] = base64ImageStr["_body"];
		});
	}

	getThumbnailImageForUser(user) {
		let self = this;
		if (self.thumbnailImages[user["id"]] === undefined)
			self.setThumbnailImageForUser(user);

		// TODO: control the size of this list.. think: memory issues. Perhaps a structure
		// which keeps the list, and only the last N recently used entries remain in the list
		// If one gets pushed out of the RUL, it has to be recalled from the API. So, 
		// a queue max length N, as userIds are called in the api, the userIds are pushed
		// in the queue, until it gets to N length, and then one is pushed. The first one in is pushed.

		if (self.thumbnailImages[user["id"]] === undefined)
			return "assets/img/mushroom.jpg";
		else if (self.thumbnailImages[user["id"]].length < 6)
			return "assets/img/mushroom.jpg";
		else
			return "data:image/jpeg;base64," + self.thumbnailImages[user["id"]];
	}

	onSearchBtnTap(evt) {
		let self = this;
		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();
		this._searchService.searchUsers(this.searchString).then((data) => {
			self.loading.dismiss();
			self.resultList = data;
		});
	}

	setPointable(user) {
		let self = this;
		this._pointsService.isCurrentUserAbleToSendAPointTo(user["id"]).then((bool) => {
			self.isPointableObj[user["id"]] = bool;
		});
	}

	isPointable(user) {
		let hasOwnPropertyForGivenUserId = this.isPointableObj[user["id"]] !== undefined;
		if (!hasOwnPropertyForGivenUserId) {
			this.isPointableObj[user["id"]] = null;
			this.setPointable(user);
		}

		return hasOwnPropertyForGivenUserId && this.isPointableObj[user["id"]] === true;
	}

	getSendPointColor(user) {
		return this.isPointable(user) ? "green" : "red";
	}

	setRecommendable(user) {
		let self = this;
		this._recommendationService.isCurrentUserAbleToSendARecommendationTo(user["id"]).then((bool) => {
			self.isRecommendableObj[user["id"]] = bool;
		});
	}

	isRecommendable(user) {
		let hasOwnPropertyForGivenUserId = this.isRecommendableObj[user["id"]] !== undefined;
		if (!hasOwnPropertyForGivenUserId) {
			this.isRecommendableObj[user["id"]] = null;
			this.setRecommendable(user);
		}

		return hasOwnPropertyForGivenUserId && this.isRecommendableObj[user["id"]] === true;
	}

	getSendRecommendColor(user) {
		return this.isRecommendable(user) ? "green" : "red";
	}

	onSendPointBtnTap(evt, item) {
		let modal = this.modalCtrl.create(SendPointPage, {user: item});
		modal.onDidDismiss(data => { this.ngOnInit(); });
		modal.present();
	}

	onSendRecommendBtnTap(evt, item) {
		let modal = this.modalCtrl.create(SendRecommendPage, {user: item});
		modal.onDidDismiss(data => { this.ngOnInit(); });
		modal.present();
	}

	onViewProfileBtnTap(evt, item) {
		let modal = this.modalCtrl.create(ProfilePage, {user: item, readOnly: true});
		modal.onDidDismiss(data => {  });
		modal.present();
	}
}

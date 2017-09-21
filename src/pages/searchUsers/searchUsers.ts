import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { SendPointPage } from './_pages/send.point.page'
import { SendRecommendPage } from './_pages/send.recommend.page'
import { ProfilePage } from '../../pages/profile/profile'

import { UserService } from '../../app/_services/user.service';
import { RecommendationService } from '../../app/_services/recommendation.service';
import { PointsService } from '../../app/_services/points.service';
import { UserMetadataService } from '../../app/_services/user-metadata.service';
import { SearchService } from '../../app/_services/search.service';

import { Constants } from '../../_constants/constants'

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
				private _userMetadataService: UserMetadataService,
				private _userService: UserService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService,
				private _constants: Constants,
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

	isPointable(user) {
		return this._userMetadataService.getMetadataValue(user, this._constants.FUNCTION_KEY_CAN_SEND_POINT_TO_USER);
	}

	getSendPointColor(user) {
		return this.isPointable(user) ? "green" : "red";
	}

	isRecommendable(user) {
		return this._userMetadataService.getMetadataValue(user, this._constants.FUNCTION_KEY_CAN_SEND_RECOMMENDATION_TO_USER);
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

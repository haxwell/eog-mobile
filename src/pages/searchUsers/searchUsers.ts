import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { SendPointPage } from './_pages/send.point.page'
import { SendRecommendPage } from './_pages/send.recommend.page'
import { ProfilePage } from '../../pages/profile/profile'

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

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService) {

	}

	ngOnInit() {
		this.isPointableObj = {};
		this.isRecommendableObj = {};

		this._recommendationService.init();
		this._pointsService.init();
	}

	onSearchBtnTap(evt) {
		let self = this;
		this._searchService.searchUsers(this.searchString).then((data) => {
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

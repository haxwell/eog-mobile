import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { SendPointPage } from './_pages/send.point.page'
import { SendRecommendPage } from './_pages/send.recommend.page'

import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';
import { RequestsService } from '../../app/_services/requests.service';
import { RecommendationService } from '../../app/_services/recommendation.service';

@Component({
  selector: 'page-search-users',
  templateUrl: 'searchUsers.html'
})
export class SearchUsersPage {
	searchString = '';
	resultList = undefined;

	userSearchResultsPromise = undefined;

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _requestsService: RequestsService,
				private _recommendationService: RecommendationService) {

	}

	ngOnInit() {
		let self = this;

		this._recommendationService.init();
		this._pointsService.init();
	}

	onSearchBtnTap(evt) {
		let self = this;
		this._searchService.searchUsers(this.searchString).then((data) => {
			self.resultList = data;
		});
	}

	isPointable(user) {
		return true;
	}

	isRecommendable(user) {
		return true;
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
}

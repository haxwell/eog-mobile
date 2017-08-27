import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { SearchService } from '../../../app/_services/search.service';

@Component({
  selector: 'page-thing-detail-rule',
  templateUrl: 'rule.html'
})
export class RulePage {
	searchString: string = '';
	searchResultListCounString: string = undefined;
	pointsQuantity: number = 0;
	requiredUserRecommendations: Array<Object> = undefined;
	searchResultList: Array<Object> = [];
	userList: Array<Object> = [];

	constructor(public navCtrl: NavController,
				navParams: NavParams,
				private viewCtrl: ViewController, 
				private _searchService: SearchService) {

		this.pointsQuantity = navParams.get('requiredPointsQuantity') || 0;
		let tmp: Array<Object> = navParams.get('requiredUserRecommendations');

		if (tmp !== undefined) 
			this.requiredUserRecommendations = tmp.slice();
	}

	onSearchUserBtnTap(evt) {
		this._searchService.searchUsers(this.searchString).then((data: Array<Object>) => {
			this.searchResultList = data;
			this.searchResultListCounString = data.length + " matches found.";
		});
	}

	getSearchResultListCountString() {
		return this.searchResultListCounString;
	}

	handleSearchStringChange(evt) {
		this.searchResultListCounString = undefined;
	}

	isSearchBtnEnabled() {
		return this.searchString.length > 2;
	}

	isSaveBtnEnabled() {
		return this.pointsQuantity > 0;
	}

	onIndividualSearchResultTap(item) {
		this.requiredUserRecommendations.push(item);
		this.searchResultList = this.searchResultList.filter((obj) => { return obj["id"] !== item["id"]; });
	}

	onIndividualRequiredUserPress(item) {
		this.requiredUserRecommendations = this.requiredUserRecommendations.filter((obj) => { return obj["id"] !== item["id"]; });
	}

	getSearchResultList() {
		if (this.searchResultList === undefined || this.searchResultList.length === 0)
			return undefined;

		return this.searchResultList;
	}

	onSaveBtnTap(evt) {
		this.viewCtrl.dismiss({requiredPointsQuantity: this.pointsQuantity*1, requiredUserRecommendations: this.requiredUserRecommendations });
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

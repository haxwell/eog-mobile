import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { SearchService } from '../../../app/_services/search.service';

@Component({
  selector: 'page-prm-detail-rule',
  templateUrl: 'rule.html'
})
export class RulePage {
	searchString: string = '';
	searchResultListCountString: string = undefined;
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
		let self = this;
		this._searchService.searchUsers(this.searchString).then((data: Array<Object>) => {
			self.searchResultList = data;
			let tmp = self.searchResultList.filter((obj) => { 
				return !self.requiredUserRecommendations.some(
					(obj2) => { return obj["id"] === obj2["id"]; }
				) 
			});
			let count = self.searchResultList.length - tmp.length;
			self.searchResultList = tmp;
			self.searchResultListCountString = data.length + " matches found. ";
			if (count > 0) self.searchResultListCountString += count + " already required.";
		});
	}

	getSearchResultListCountString() {
		return this.searchResultListCountString;
	}

	handleSearchStringChange(evt) {
		this.searchResultListCountString = undefined;
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

		if (this.searchResultList.length === 0) this.searchResultListCountString === undefined;
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

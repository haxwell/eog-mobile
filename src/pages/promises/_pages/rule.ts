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
	origSearchResultSize = 0;
	origSearchResultsAlreadyRequiredCount = 0;

	pointsQuantity: number = 0;
	requiredUserRecommendations: Array<Object> = undefined;
	searchResultList: Array<Object> = [];
	userList: Array<Object> = [];

	permitOnlyEditsToPoints = undefined;

	constructor(public navCtrl: NavController,
				navParams: NavParams,
				private viewCtrl: ViewController, 
				private _searchService: SearchService) {

		this.pointsQuantity = navParams.get('requiredPointsQuantity') || 0;
		let tmp: Array<Object> = navParams.get('requiredUserRecommendations');

		if (tmp !== undefined) 
			this.requiredUserRecommendations = tmp.slice();

		this.permitOnlyEditsToPoints = navParams.get('permitOnlyEditsToPoints');
	}

	onSearchUserBtnTap(evt) {
		if (this.isSearchBtnEnabled()) {
			let self = this;
			this._searchService.searchUsers(this.searchString).then((data: Array<Object>) => {
				self.searchResultList = data;
				self.origSearchResultSize = data.length;
				self.origSearchResultsAlreadyRequiredCount = 0;

				let tmp = self.searchResultList.filter((obj) => { 
					return !self.requiredUserRecommendations.some(
						(obj2) => { return obj["id"] === obj2["requiredRecommendUserId"]; }
					) 
				});

				self.origSearchResultsAlreadyRequiredCount = self.origSearchResultSize - tmp.length;
				self.searchResultList = tmp;			

				self.updateSearchResultListCountString();
			});
		}
	}

	updateSearchResultListCountString() {
		this.searchResultListCountString = this.origSearchResultSize + " matches found. ";
		if (this.origSearchResultsAlreadyRequiredCount > 0)
			this.searchResultListCountString += this.origSearchResultsAlreadyRequiredCount + " already required.";
	}

	getSearchResultListCountString() {
		return this.searchResultListCountString;
	}

	handleSearchStringChange(evt) {
		this.searchResultListCountString = undefined;
	}

	isSearchBtnEnabled() {
		return this.searchString.length > 2 && this.permitOnlyEditsToPoints !== true;
	}

	isSaveBtnEnabled() {
		return this.pointsQuantity > 0;
	}

	hasRequiredRecommendations() {
		return this.requiredUserRecommendations.length > 0;
	}

	onIndividualSearchResultTap(item) {
		if (this.permitOnlyEditsToPoints !== true) {
			this.requiredUserRecommendations.push({id: -1, requiredRecommendUserId: item["id"], userObj: item});
			this.searchResultList = this.searchResultList.filter((obj) => { return obj["id"] !== item["id"]; });

			this.origSearchResultsAlreadyRequiredCount++;
			this.updateSearchResultListCountString();
		}
	}

	onIndividualRequiredUserPress(item) {
		if (this.permitOnlyEditsToPoints !== true) {
			this.requiredUserRecommendations = this.requiredUserRecommendations.filter((obj) => { return obj["userObj"]["id"] !== item["userObj"]["id"]; });
			this.searchResultList.push(item["userObj"]);

			this.origSearchResultsAlreadyRequiredCount--;
			this.updateSearchResultListCountString();
		}
	}

	getSearchResultList() {
		if (this.searchResultList === undefined || this.searchResultList.length === 0 || this.permitOnlyEditsToPoints)
			return undefined;

		return this.searchResultList;
	}

	onSaveBtnTap(evt) {
		this.viewCtrl.dismiss({requiredPointsQuantity: Math.ceil(this.pointsQuantity*1), requiredUserRecommendations: this.requiredUserRecommendations });
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

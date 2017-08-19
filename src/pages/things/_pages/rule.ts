import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

import { SearchService } from '../../../app/_services/search.service';
import { RuleService } from './_services/rule.service';

@Component({
  selector: 'page-thing-detail-rule',
  templateUrl: 'rule.html'
})
export class RulePage {
	searchString = '';
	pointsQuantity = 0;
	resultList = undefined;
	userList = [];

	constructor(public navCtrl: NavController, 
				private viewCtrl: ViewController, 
				private _searchService: SearchService,
				private _ruleService: RuleService) {

	}

	onSearchUserBtnTap(evt) {
		this._searchService.searchUsers(this.searchString).then((data) => {
			this.resultList = data;
		});
	}

	isSaveBtnEnabled() {
		return this.pointsQuantity > 0 && this.userList.length > 0;
	}

	onMatchingRadioBtnTap(evt) {
		this.resultList.map((obj) => { obj["isSelectedMatch"] = false; if (obj["realname"] === evt) {obj["isSelectedMatch"] = true;} });
	}

	onRequiredRadioBtnTap(evt) {
		this.resultList.map((obj) => { obj["isSelectedRequired"] = false; if (obj["realname"] === evt) {obj["isSelectedRequired"] = true;} });
	}

	addSelectedUser(evt) {
		let user = this.resultList.find((obj) => { return obj["isSelectedMatch"]});
		user["isSelectedRequirement"] = true;
		user["isSelectedMatch"] = false;

		this.userList.push(user);
	}

	removeRequiredUser(evt) {
		let user = this.resultList.find((obj) => { return obj["isSelectedRequirement"]});
		user["isSelectedRequirement"] = false;

		this.userList = this.userList.filter((obj) => { return obj["id"] !== user["id"]; });
	}

	getMatchingUserList() {
		if (this.resultList === undefined)
			return undefined;

		return this.resultList.filter((obj) => { return !obj.hasOwnProperty("isSelectedRequirement") || obj["isSelectedRequirement"] === false; })
	}

	getRequiredUserList() {
		//if (this.resultList === undefined)
		//	return undefined;

		//return this.resultList.filter((obj) => { return obj["isSelectedRequirement"]; })
		return this.userList;
	}

	onSaveBtnTap(evt) {
		//this.resultList.map((obj) => { delete obj["isSelectedMatch"]; delete obj["isSelectedRequirement"]; });

		this.viewCtrl.dismiss({pointsQuantity: this.pointsQuantity, requiredUsers: this.userList });
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

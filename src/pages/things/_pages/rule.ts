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
		return this.pointsQuantity > 0 && this.resultList.some((obj) => { return obj["isSelected"]; });
	}

	onRadioBtnTap(evt) {
		this.resultList.map((obj) => { obj["isSelected"] = false; if (obj["realname"] === evt) {obj["isSelected"] = true;} });
	}

	onSaveBtnTap(evt) {
		let user = this.resultList.find((obj) => { return obj["isSelected"]; });
		delete user["isSelected"];
		
		this.viewCtrl.dismiss({pointsQuantity: this.pointsQuantity, requiredUser: user });
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

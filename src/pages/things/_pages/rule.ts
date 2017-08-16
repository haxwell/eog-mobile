import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchService } from '../../../app/_services/search.service';

@Component({
  selector: 'page-thing-detail-rule',
  templateUrl: 'rule.html'
})
export class RulePage {
	searchString = '';
	resultList = undefined;

	constructor(public navCtrl: NavController, private _searchService: SearchService) {

	}

	onSearchUserBtnTap($event) {
		this._searchService.searchUsers(this.searchString).then((data) => {
			this.resultList = data;
		});
	}
}

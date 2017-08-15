import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchService } from './_services/search.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = '';
	resultList = undefined;

	constructor(public navCtrl: NavController, private _searchService: SearchService) {

	}

	onSearchBtnTap($event) {
		this._searchService.search(this.searchString).then((data) => {
			this.resultList = data;
		});
	}
}

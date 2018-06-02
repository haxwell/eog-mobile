import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'tab-searchUserResults',
  templateUrl: 'searchUserResultsTab.html'
})
export class SearchUserResultsTab {
	
	results = undefined;

	constructor(public navCtrl: NavController, 
				public navParams: NavParams) {

		this.results = navParams.get("results") || [];
	}

	areResultsAvailable() {
		return this.results !== undefined && this.results.length > 0;
	}
}

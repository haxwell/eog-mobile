import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'tab-searchPrmResults',
  templateUrl: 'searchPrmResultsTab.html'
})
export class SearchPrmResultsTab {
	
	results = undefined;

	constructor(public navCtrl: NavController, 
				public navParams: NavParams) {

		this.results = navParams.data || [];
	}

	setResults(r) {
		this.results = r;
	}

	areResultsAvailable() {
		return this.results !== undefined && this.results.length > 0;
	}
}

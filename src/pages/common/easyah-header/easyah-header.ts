import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchPage } from '../../search/search';

@Component({
  selector: 'easyah-header',
  templateUrl: 'easyah-header.html'
})

export class EasyahHeader {

	searchTextFieldValue = undefined;
	//searchTextFieldValue = 'denver';

	constructor(private navCtrl: NavController) {
		
	}

	onSearchBtnTap(evt) {
    	this.navCtrl.push(SearchPage, {searchString: this.searchTextFieldValue});
	}

	onSearchTextFieldChanged(evt) {
		this.searchTextFieldValue = evt._value;
	}

	getSearchTextFieldValue() {
		return this.searchTextFieldValue;
	}

	isSearchBtnAvailable() {
		return this.searchTextFieldValue !== undefined && this.searchTextFieldValue.length >= 3;
	}
}
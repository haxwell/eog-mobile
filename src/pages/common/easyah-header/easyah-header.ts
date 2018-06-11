import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchPage } from '../../search/search';

import { environment } from '../../../_environments/environment';

@Component({
  selector: 'easyah-header',
  templateUrl: 'easyah-header.html'
})

export class EasyahHeader {

	searchTextFieldValue = undefined;

	constructor(private navCtrl: NavController) {
		if ( !environment.production )
			this.searchTextFieldValue = 'denver'
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
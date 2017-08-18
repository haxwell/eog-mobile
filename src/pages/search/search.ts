import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { RequestPage } from './_pages/request'

import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = '';
	resultList = undefined;
	userPoints = undefined;

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService) {

	}

	ngOnInit() {
		this._pointsService.getCurrentUserPoints().then((data) => {
			this.userPoints = data;
		});
	}

	onSearchBtnTap(evt) {
		this._searchService.searchThings(this.searchString).then((data) => {
			this.resultList = data;
		});
	}

	getUserHasSufficientPointsGivenRules(rulesArray) {
		return this._pointsService.getUserHasSufficientPointsGivenRules(rulesArray, this.userPoints);
	}

	onRequestBtnTap(evt, item) {
		let modal = this.modalCtrl.create(RequestPage, {thing: item});
		//modal.onDidDismiss(data => {  });
		modal.present();
	}
}

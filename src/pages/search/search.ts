import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { RequestPage } from './_pages/request'

import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';
import { RequestsService } from '../../app/_services/requests.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = '';
	resultList = undefined;
	userPoints = undefined;
	requestsList = undefined;

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _requestsService: RequestsService) {

	}

	ngOnInit() {
		this._pointsService.getCurrentUserPoints().then((data) => {
			this.userPoints = data;
		});

		this._requestsService.getModelForOutgoing().then((data) => {
			this.requestsList = data;
		})
	}

	onSearchBtnTap(evt) {
		this._searchService.searchThings(this.searchString).then((data) => {
			this.resultList = data;
		});
	}

	getUserHasSufficientPointsGivenRules(thing) {
		return this._pointsService.getUserHasSufficientPointsGivenRules(thing["rules"], this.userPoints);
	}

	getUserHasAlreadyRequestedThisThing(thing) {
		return this.requestsList.some((obj) => { return obj["thing"]["id"] === thing["id"]; })
	}

	isRequestable(thing) {
		return this.getUserHasSufficientPointsGivenRules(thing) && !this.getUserHasAlreadyRequestedThisThing(thing);
	}

	onRequestBtnTap(evt, item) {
		let modal = this.modalCtrl.create(RequestPage, {thing: item});
		//modal.onDidDismiss(data => {  });
		modal.present();
	}
}

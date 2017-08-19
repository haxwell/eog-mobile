import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { RequestPage } from './_pages/request'

import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';
import { RequestsService } from '../../app/_services/requests.service';
import { RecommendationService } from '../../app/_services/recommendation.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = '';
	resultList = undefined;
	userPoints = undefined;
	requestsList = undefined;
	isRequestableObj = {};

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _requestsService: RequestsService,
				private _recommendationService: RecommendationService) {

	}

	ngOnInit() {
		this._recommendationService.init();

		this._pointsService.getCurrentAvailableUserPoints().then((data) => {
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
		this.isRequestableObj[thing["id"]]["sufficientPoints"] = this._pointsService.getUserHasSufficientPointsGivenRules(thing, this.userPoints);
	}

	getUserHasAlreadyRequestedThisThing(thing) {
		this.isRequestableObj[thing["id"]]["alreadyRequested"] = this.requestsList.some((obj) => { return obj["thing"]["id"] === thing["id"]; })
	}

	getUserHasNecessaryRecommendations(thing) {
		this._recommendationService.getUserHasNecessaryRecommendations(thing).then((data) => {
			this.isRequestableObj[thing["id"]]["necessaryRecommendations"] = data;
		});
	}

	isRequestable(thing) {
		if (!this.isRequestableObj[thing["id"]]) {
			this.isRequestableObj[thing["id"]] = {};
			this.getUserHasSufficientPointsGivenRules(thing),
			this.getUserHasAlreadyRequestedThisThing(thing),
			this.getUserHasNecessaryRecommendations(thing);
		}

		return 	this.isRequestableObj[thing["id"]] &&
				this.isRequestableObj[thing["id"]]["sufficientPoints"] &&
				!this.isRequestableObj[thing["id"]]["alreadyRequested"] &&
				this.isRequestableObj[thing["id"]]["necessaryRecommendations"];
	}

	onRequestBtnTap(evt, item) {
		this.isRequestableObj[item["id"]] = undefined;
		let modal = this.modalCtrl.create(RequestPage, {thing: item});
		//modal.onDidDismiss(data => {  });
		modal.present();
	}
}

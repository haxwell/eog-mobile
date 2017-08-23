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

	requestsPromise = undefined;

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _requestsService: RequestsService,
				private _recommendationService: RecommendationService) {

	}

	ngOnInit() {
		let self = this;
		this.isRequestableObj = {};
		this.userPoints = undefined;
		this.requestsList = undefined;
		this._recommendationService.init().then((data) => {
			self._pointsService.getCurrentAvailableUserPoints().then((data) => {
				self.userPoints = data;
			});

			self.requestsPromise = new Promise((resp, rej) => {
			 	self._requestsService.getModelForOutgoing().then((data) => {
					resp(data);
				})
			})
		})
	}

	onSearchBtnTap(evt) {
		let self = this;
		this._searchService.searchThings(this.searchString).then((data) => {
			self.resultList = data;
		});
	}

	getUserHasSufficientPointsGivenRules(thing) {
		this.isRequestableObj[thing["id"]]["sufficientPoints"] = thing["requiredPointsQuantity"] <= this.userPoints;
	}

	getUserHasAlreadyRequestedThisThing(thing) {
		let self = this;
		this.requestsPromise.then((data) => {
			self.isRequestableObj[thing["id"]]["alreadyRequested"] = data.some((obj) => { return obj["thing"]["id"] === thing["id"]; })
		});
	}

	getUserHasNecessaryRecommendations(thing) {
		let self = this;
		this._recommendationService.getUserHasNecessaryRecommendations(thing).then((data) => {
			self.isRequestableObj[thing["id"]]["necessaryRecommendations"] = data;
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
		modal.onDidDismiss(data => { this.ngOnInit(); });
		modal.present();
	}
}

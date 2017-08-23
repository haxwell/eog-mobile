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

	requestsPromise = undefined;

	userHasNecessaryRecommendationsCache = {};	
	userHasSufficientPointsGivenRulesCache = {};
	userHasAlreadyRequestedThisThingCache = {};

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private modalCtrl: ModalController,
				private _pointsService: PointsService,
				private _requestsService: RequestsService,
				private _recommendationService: RecommendationService) {

	}

	ngOnInit() {
		let self = this;

		self.userHasSufficientPointsGivenRulesCache	= {};
		self.userHasNecessaryRecommendationsCache = {};	
		self.userHasAlreadyRequestedThisThingCache = {};

		this._recommendationService.init();
		this._pointsService.init();
	}

	onSearchBtnTap(evt) {
		let self = this;
		this._searchService.searchThings(this.searchString).then((data) => {
			self.resultList = data;
		});
	}

	setUserHasSufficientPointsGivenRules(thing) {
		let self = this;
		this._pointsService.getCurrentAvailableUserPoints().then((data) => {
			self.userHasSufficientPointsGivenRulesCache[thing["id"]] = (thing["requiredPointsQuantity"] <= data);
		});
	}

	setUserHasAlreadyRequestedThisThing(thing) {
		let self = this;
		this._requestsService.getModelForOutgoing().then((data: Array<Object>) => {
			self.userHasAlreadyRequestedThisThingCache[thing["id"]] = data.some((obj) => { return obj["thing"]["id"] === thing["id"]; });
		});
	}

	setUserHasNecessaryRecommendations(thing) {
		let self = this;
		this._recommendationService.getUserHasNecessaryRecommendations(thing).then((data) => {
			self.userHasNecessaryRecommendationsCache[thing["id"]] = data;
		});
	}

	isRequestable(thing) {
		if (this.userHasNecessaryRecommendationsCache[thing["id"]] === undefined) {
			this.userHasNecessaryRecommendationsCache[thing["id"]] = null;
			this.setUserHasNecessaryRecommendations(thing);
		}

		if (this.userHasAlreadyRequestedThisThingCache[thing["id"]] === undefined) {
			this.userHasAlreadyRequestedThisThingCache[thing["id"]] = null;
			this.setUserHasAlreadyRequestedThisThing(thing);
		}

		if (this.userHasSufficientPointsGivenRulesCache[thing["id"]] === undefined) {
			this.userHasSufficientPointsGivenRulesCache[thing["id"]] = null;
			this.setUserHasSufficientPointsGivenRules(thing);
		}

		return 	(this.userHasNecessaryRecommendationsCache[thing["id"]] === true) &&
				!(this.userHasAlreadyRequestedThisThingCache[thing["id"]] === true) &&
				(this.userHasSufficientPointsGivenRulesCache[thing["id"]] === true);
	}

	onRequestBtnTap(evt, item) {
		let modal = this.modalCtrl.create(RequestPage, {thing: item});
		modal.onDidDismiss(data => { this.ngOnInit(); });
		modal.present();
	}
}

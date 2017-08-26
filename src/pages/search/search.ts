import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { RequestPage } from './_pages/request'
import { ThingPage } from '../things/things'

import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';
import { RequestsService } from '../../app/_services/requests.service';
import { RecommendationService } from '../../app/_services/recommendation.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = 'denv';
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

	initRequirementsCache(thing) {
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
	}

	getNecessaryRecommendationsIconColor(thing) {
		this.initRequirementsCache(thing);
		if (this.userHasNecessaryRecommendationsCache[thing["id"]] === true)
			return "green";
		else
			return "red";
	}

	getAlreadyRequestedIconColor(thing) {
		this.initRequirementsCache(thing);
		if (this.userHasAlreadyRequestedThisThingCache[thing["id"]] === false)
			return "green";
		else
			return "red";
	}

	getSufficientPointsIconColor(thing) {
		this.initRequirementsCache(thing);
		if (this.userHasSufficientPointsGivenRulesCache[thing["id"]] === true)
			return "green";
		else
			return "red";
	}

	areRecommendationsRequired(thing) {
		return (thing["requiredUserRecommendations"] && thing["requiredUserRecommendations"].length > 0);
	}

	thingCallback = (_params) => {
		return new Promise((resolve, reject) => {
//			this.setDirty(_params === true);
			resolve();
		});
	}

	showThingDetail(_thing) {
		let msgs = [];

		if (this.userHasSufficientPointsGivenRulesCache[_thing["id"]] === true) {
			msgs.push({type: 'go', msg: 'You have enough points to request this Thing.'});
		} else {
			msgs.push({type: 'stop', msg: 'You need more points in order to request this Thing.'});
		}

		if (this.userHasAlreadyRequestedThisThingCache[_thing["id"]] === false) {
			msgs.push({type: 'go', msg: 'You have not yet requested this Thing.'});
		} else {
			msgs.push({type: 'stop', msg: 'You have already requested this Thing.'});
		}

		if (this.areRecommendationsRequired(_thing)) {
			if (this.userHasNecessaryRecommendationsCache[_thing["id"]] === true) {
				msgs.push({type: 'go', msg: 'You have enough recommendations to request this Thing.'});
			} else {
				msgs.push({type: 'stop', msg: 'You need additional recommendations in order to request this Thing.'});
			}
		}

		this.navCtrl.push(ThingPage, { thing: _thing, readOnly: true, requestable: this.isRequestable(_thing), requestMsgs: msgs });
	}
}

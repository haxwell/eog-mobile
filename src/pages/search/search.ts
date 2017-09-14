import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { PrmPage } from '../promises/promises'

import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';
import { RequestsService } from '../../app/_services/requests.service';
import { UserService } from '../../app/_services/user.service';
import { RecommendationService } from '../../app/_services/recommendation.service';

import Moment from 'moment'

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = 'denv';
	resultList = undefined;
	dirty = false;
	loading = undefined;

	requestsPromise = undefined;

	userHasNecessaryRecommendationsCache = {};	
	userHasSufficientPointsGivenRulesCache = {};
	userHasAlreadyRequestedThisPrmCache = {};
	userIsPastRequestAgainDateCache = {};
	archivedRequestsForPrm = {};

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private _pointsService: PointsService,
				private _requestsService: RequestsService,
				private _userService: UserService,
				private _recommendationService: RecommendationService,
				private loadingCtrl: LoadingController,
				_events: Events) {
		let func = (data) => {
			// a declined event means points that were escrowed have become available,
			//  so that means the state rules, (sufficient points, already requested, necessary recommends)
			//  need to be recalculated. So init everything.
			this.ngOnInit(); 
		};

		_events.subscribe('request:declined', func);
		_events.subscribe('request:deleted', func);
		_events.subscribe('request:completedAndAccepted', func);
		_events.subscribe('recommendation:received', func);
		_events.subscribe('points:received', func);
	}

	ngOnInit() {
		let self = this;

		self.userHasSufficientPointsGivenRulesCache	= {};
		self.userHasNecessaryRecommendationsCache = {};	
		self.userHasAlreadyRequestedThisPrmCache = {};

		this._recommendationService.init();
		this._pointsService.init();

		this.setDirty(false);
	}

	ionViewWillEnter() {
		if (this.isDirty()) 
			this.ngOnInit();
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	onSearchBtnTap(evt?) {
		let self = this;
		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();

		this._searchService.searchPrms(this.searchString).then((data: Array<Object>) => {
			self.ngOnInit();

			data.map((obj) => {
				self._userService.getUser(obj["userId"]).then((user) => {
					obj["directionallyOppositeUser"] = user;
					delete obj["userId"];

					if (!data.some((obj) => { return obj["userId"] != undefined; })) {
						self.resultList = data;
						self.loading.dismiss();
					}
				});
			});
		});
	}

	setUserHasSufficientPointsGivenRules(prm) {
		let self = this;
		this._pointsService.getCurrentAvailableUserPoints().then((data) => {
			self.userHasSufficientPointsGivenRulesCache[prm["id"]] = (prm["requiredPointsQuantity"] <= data);
		});
	}

	setUserHasAlreadyRequestedThisPrm(prm) {
		let self = this;
		this._requestsService.getModelForOutgoing().then((data: Array<Object>) => {
			self.userHasAlreadyRequestedThisPrmCache[prm["id"]] = data.some((obj) => { return obj["promise"]["id"] === prm["id"]; });
		});
	}

	setUserHasNecessaryRecommendations(prm) {
		let self = this;
		this._recommendationService.getUserHasNecessaryRecommendations(prm).then((data) => {
			self.userHasNecessaryRecommendationsCache[prm["id"]] = data;
		});
	}

	setUserIsPastRequestAgainDateCache(prm) {
		let self = this;
		this._requestsService.getArchivedUserRequestsForPrm(prm).then((data: Array<Object>) => {
			if (data.length > 0) {
				self.archivedRequestsForPrm[prm["id"]] = data;
				self.userIsPastRequestAgainDateCache[prm["id"]] = data.some((obj: Object) => {
					let canRequestAgainDate = obj["canRequestAgainDate"];

					return Moment(canRequestAgainDate) < Moment(new Date().getTime());
				});
			}
		});
	}

	isRequestable(prm) {
		if (this.userHasNecessaryRecommendationsCache[prm["id"]] === undefined) {
			this.userHasNecessaryRecommendationsCache[prm["id"]] = null;
			this.setUserHasNecessaryRecommendations(prm);
		}

		if (this.userHasAlreadyRequestedThisPrmCache[prm["id"]] === undefined) {
			this.userHasAlreadyRequestedThisPrmCache[prm["id"]] = null;
			this.setUserHasAlreadyRequestedThisPrm(prm);
		}

		if (this.userHasSufficientPointsGivenRulesCache[prm["id"]] === undefined) {
			this.userHasSufficientPointsGivenRulesCache[prm["id"]] = null;
			this.setUserHasSufficientPointsGivenRules(prm);
		}

		if (this.userIsPastRequestAgainDateCache[prm["id"]] === undefined) {
			this.userIsPastRequestAgainDateCache[prm["id"]] = null;
			this.setUserIsPastRequestAgainDateCache(prm);
		}

		return 	(this.userHasNecessaryRecommendationsCache[prm["id"]] === true) &&
				!(this.userHasAlreadyRequestedThisPrmCache[prm["id"]] === true) &&
				(this.userHasSufficientPointsGivenRulesCache[prm["id"]] === true) &&
				(this.userIsPastRequestAgainDateCache[prm["id"]] === true || this.userIsPastRequestAgainDateCache[prm["id"]] === null);
	}

	initRequirementsCache(prm) {
		if (this.userHasNecessaryRecommendationsCache[prm["id"]] === undefined) {
			this.userHasNecessaryRecommendationsCache[prm["id"]] = null;
			this.setUserHasNecessaryRecommendations(prm);
		}

		if (this.userHasAlreadyRequestedThisPrmCache[prm["id"]] === undefined) {
			this.userHasAlreadyRequestedThisPrmCache[prm["id"]] = null;
			this.setUserHasAlreadyRequestedThisPrm(prm);
		}

		if (this.userHasSufficientPointsGivenRulesCache[prm["id"]] === undefined) {
			this.userHasSufficientPointsGivenRulesCache[prm["id"]] = null;
			this.setUserHasSufficientPointsGivenRules(prm);
		}

		if (this.userIsPastRequestAgainDateCache[prm["id"]] === undefined) {
			this.userIsPastRequestAgainDateCache[prm["id"]] = null;
			this.setUserIsPastRequestAgainDateCache(prm);
		}
	}

	getNecessaryRecommendationsIconColor(prm) {
		this.initRequirementsCache(prm);
		if (this.userHasNecessaryRecommendationsCache[prm["id"]] === true)
			return "green";
		else
			return "red";
	}

	getAlreadyRequestedIconColor(prm) {
		this.initRequirementsCache(prm);
		if (this.userHasAlreadyRequestedThisPrmCache[prm["id"]] === false)
			return "green";
		else
			return "red";
	}

	getSufficientTimeIconColor(prm) {
		this.initRequirementsCache(prm);
		if (this.userIsPastRequestAgainDateCache[prm["id"]] === true)
			return "green";
		else
			return "red";
	}

	getSufficientPointsIconColor(prm) {
		this.initRequirementsCache(prm);
		if (this.userHasSufficientPointsGivenRulesCache[prm["id"]] === true)
			return "green";
		else
			return "red";
	}

	hasPrmBeenPreviouslyRequested(prm) {
		return this.archivedRequestsForPrm[prm["id"]] !== undefined && this.archivedRequestsForPrm[prm["id"]] !== null && this.archivedRequestsForPrm[prm["id"]].length > 0;
	}

	areRecommendationsRequired(prm) {
		return (prm["requiredUserRecommendations"] && prm["requiredUserRecommendations"].length > 0);
	}

	prmCallback = (_params) => {
		return new Promise((resolve, reject) => {
			//this.onSearchBtnTap();
			this.setDirty(true);
			resolve();
		});
	}

	showPromiseDetail(_prm) {
		let _msgs = [];

		let self = this;
		if (this.userHasAlreadyRequestedThisPrmCache[_prm["id"]] === true) {
			_msgs.push({type: 'alreadyRequested', msg: 'You have already requested this Promise.'});
		} else if (this.userIsPastRequestAgainDateCache[_prm["id"]] === false) {
			_msgs.push({type: 'timeRemaining', msg: 'The author set a time limit before you can request this Promise again. You still have time remaining.'});
		} else {
			if (this.userHasSufficientPointsGivenRulesCache[_prm["id"]] === false) {
				this._pointsService.getCurrentAvailableUserPoints().then((data) => {
					_msgs.push({type: 'points', msg: (_prm["requiredPointsQuantity"] - data) + ' more points'});
				});
			}

			if (this.areRecommendationsRequired(_prm)) {
				if (this.userHasNecessaryRecommendationsCache[_prm["id"]] === false) {
					let tmpReqdRecs = _prm["requiredUserRecommendations"].slice();
					self._recommendationService.getIncomingRecommendations().then((list: Array<Object>) => {

						// inefficient O(n2) algorithm.. but the lists should 
						// be relatively short, so it kinda (kinda) okay.
						for (var y=0; y < list.length; y++) {
							for (var x=0; x < tmpReqdRecs.length; x++) {
								if (tmpReqdRecs[x]["requiredRecommendUserId"] === list[y]["providingUserId"])
									tmpReqdRecs[x] = undefined;
							}
						}

						for (var z=0; z < tmpReqdRecs.length; z++) {
							if (tmpReqdRecs[z] !== undefined) {
								self._userService.getUser(tmpReqdRecs[z]["requiredRecommendUserId"]).then((user) => {
									_msgs.push({ type: 'reqd', msg: user["realname"] });
								});
							}
						}
					});
				}
			}
		}

		this.navCtrl.push(PrmPage, { prm: _prm, readOnly: true, callback: self.prmCallback, requestable: this.isRequestable(_prm), requestMsgs: _msgs  });
	}
}

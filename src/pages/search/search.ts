import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { ThingPage } from '../things/things'

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
	userHasAlreadyRequestedThisThingCache = {};
	userIsPastRequestAgainDateCache = {};
	archivedRequestsForThing = {};

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
		self.userHasAlreadyRequestedThisThingCache = {};

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

		this._searchService.searchThings(this.searchString).then((data: Array<Object>) => {
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

	setUserIsPastRequestAgainDateCache(thing) {
		let self = this;
		this._requestsService.getArchivedUserRequestsForThing(thing).then((data: Array<Object>) => {
			if (data.length > 0) {
				self.archivedRequestsForThing[thing["id"]] = data;
				self.userIsPastRequestAgainDateCache[thing["id"]] = data.some((obj: Object) => {
					let canRequestAgainDate = obj["canRequestAgainDate"];

					return Moment(canRequestAgainDate) < Moment(new Date().getTime());
				});
			}
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

		if (this.userIsPastRequestAgainDateCache[thing["id"]] === undefined) {
			this.userIsPastRequestAgainDateCache[thing["id"]] = null;
			this.setUserIsPastRequestAgainDateCache(thing);
		}

		return 	(this.userHasNecessaryRecommendationsCache[thing["id"]] === true) &&
				!(this.userHasAlreadyRequestedThisThingCache[thing["id"]] === true) &&
				(this.userHasSufficientPointsGivenRulesCache[thing["id"]] === true) &&
				(this.userIsPastRequestAgainDateCache[thing["id"]] === true);
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

		if (this.userIsPastRequestAgainDateCache[thing["id"]] === undefined) {
			this.userIsPastRequestAgainDateCache[thing["id"]] = null;
			this.setUserIsPastRequestAgainDateCache(thing);
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

	getSufficientTimeIconColor(thing) {
		this.initRequirementsCache(thing);
		if (this.userIsPastRequestAgainDateCache[thing["id"]] === true)
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

	hasThingBeenPreviouslyRequested(thing) {
		return this.archivedRequestsForThing[thing["id"]] !== undefined && this.archivedRequestsForThing[thing["id"]] !== null && this.archivedRequestsForThing[thing["id"]].length > 0;
	}

	areRecommendationsRequired(thing) {
		return (thing["requiredUserRecommendations"] && thing["requiredUserRecommendations"].length > 0);
	}

	thingCallback = (_params) => {
		return new Promise((resolve, reject) => {
			//this.onSearchBtnTap();
			this.setDirty(true);
			resolve();
		});
	}

	showThingDetail(_thing) {
		let _msgs = [];

		let self = this;
		if (this.userHasAlreadyRequestedThisThingCache[_thing["id"]] === true) {
			_msgs.push({type: 'alreadyRequested', msg: 'You have already requested this Thing.'});
		} else if (this.userIsPastRequestAgainDateCache[_thing["id"]] === false) {
			_msgs.push({type: 'timeRemaining', msg: 'The author set a time limit before you can request this Thing again. You still have time remaining.'});
		} else {
			if (this.userHasSufficientPointsGivenRulesCache[_thing["id"]] === false) {
				this._pointsService.getCurrentAvailableUserPoints().then((data) => {
					_msgs.push({type: 'points', msg: (_thing["requiredPointsQuantity"] - data) + ' more points'});
				});
			}

			if (this.areRecommendationsRequired(_thing)) {
				if (this.userHasNecessaryRecommendationsCache[_thing["id"]] === false) {
					let tmpReqdRecs = _thing["requiredUserRecommendations"].slice();
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

		this.navCtrl.push(ThingPage, { thing: _thing, readOnly: true, callback: self.thingCallback, requestable: this.isRequestable(_thing), requestMsgs: _msgs  });
	}
}

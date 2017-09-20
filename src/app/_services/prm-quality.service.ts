import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { PointsService } from './points.service'
import { RecommendationService } from './recommendation.service'
import { RequestsService } from './requests.service'

import { Constants } from '../../_constants/constants'

import Moment from 'moment'

@Injectable()

/*
	This class contains a set of functions, that are keyed by constants. Each function takes a Promise,
	and returns something about it in relation to a user. So, if the user has sufficient points it will 
	return true. If the user has requested it in the past, it may return false. Etc.

	It works by having a list of functions, keyed by constants. Then an object keyed by User Id, which
	contains a value that is the promise which will return the value of the function. Then a third list
	which is the return value of the promise in the aforementioned list.

	I think this could be powerful, an object and a list of functions which return some attribute about it,
	stored in memory. Updated as changes happen. etc. Carry on.
*/

export class PrmQualityService {
	
	constructor(private _userService: UserService,
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService,
				private _requestsService: RequestsService,
				private _constants: Constants) {

	}

	mapp = {}
	mapUserToPrmQualityResults = {};
	mapPropertyKeyToCalcFunction: Array<Object> = [];

	init() {
		this.initPrmQualityCalculationFunctions();

		// TODO: do something a little more graceful than destory it all
		this.mapp = {};
		this.mapUserToPrmQualityResults = {};
	}

	definePrmQualityCalculationFunction(key, _func) {
		this.mapPropertyKeyToCalcFunction.push({property: key, func: _func});
	}

	initPrmQualityCalculationFunctions() {
		let self = this;
		this.mapUserToPrmQualityResults = {};
		this.mapPropertyKeyToCalcFunction = []; 

		this.definePrmQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS, 
			(prm) => {
				return new Promise((resolve, reject) => {
					this._pointsService.getCurrentAvailableUserPoints().then((data) => {
						resolve(prm["requiredPointsQuantity"] <= data);
					});
				})
			}); 

		this.definePrmQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM, 
			(prm) => {
				return new Promise((resolve, reject) => {
					// TODO: This method will be renamed getOutgoingRequestsForCurrentUser()
					this._requestsService.getModelForOutgoing().then((data: Array<Object>) => {
						resolve(data.some((obj) => { return obj["prm"]["id"] === prm["id"]; }));
					});
				})
			});

		this.definePrmQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS, 
			(prm) => {
				return new Promise((resolve, reject) => {
					this._recommendationService.getUserHasNecessaryRecommendations(prm).then((data) => {
						resolve(data);
					});
				})
			});

		this.definePrmQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE, 
			(prm) => {
				return new Promise((resolve, reject) => {
					this._requestsService.getArchivedUserRequestsForPrm(prm).then((archivedRequests: Array<Object>) => {
						if (archivedRequests.length > 0) {
							resolve(archivedRequests.some((request) => {
								let canRequestAgainDate = request["canRequestAgainDate"];
								return (Moment(canRequestAgainDate) < Moment(new Date().getTime()));
								}));
						} else
							resolve(null); // there is no PAST_REQUEST_AGAIN_DATE for this prm and user
					});
				})
			});

		this.definePrmQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_PRM, 
			(prm) => {
				return new Promise((resolve, reject) => {
					this._requestsService.getArchivedUserRequestsForPrm(prm).then((data: Array<Object>) => {
						resolve(data.length > 0);
					});
				})
			});

		this.definePrmQualityCalculationFunction(
			this._constants.FUNCTION_KEY_PRM_REQUIRES_RECOMMENDATIONS, 
			(prm) => {
				return new Promise((resolve, reject) => {
					resolve(prm["requiredUserRecommendations"] !== undefined && prm["requiredUserRecommendations"].length > 0);
				});
			});

		this.definePrmQualityCalculationFunction(
			self._constants.FUNCTION_KEY_PRM_IS_REQUESTABLE, 
			(prm) => {
				return new Promise((resolve, reject) => {
					let calcFunc1: (Number) => Promise<Object> = 
					self.getCalcFunction(this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS);

					calcFunc1(prm).then((data1) => {
						if (data1 === true) {
							self.getCalcFunction(self._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS)(prm).then((data2) => {
								if (data2 === true) {
									self.getCalcFunction(self._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM)(prm).then((data3) => {
										if (data3 === false) {
											self.getCalcFunction(self._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE)(prm).then((data4) => {
												if (data4 === true || data4 === null) {
													resolve(true);
												}
											});
										} else
											resolve(false);
									});
								} else 
									resolve(false);
							});
						}
						else
							resolve(false);
					});
				});
			});
	}

	getQualityValuePromise(_prm, functionKey) {
		let rtn = undefined;
		let user = this._userService.getCurrentUser();

		if (this.mapUserToPrmQualityResults[user["id"]] === undefined) 
			this.mapUserToPrmQualityResults[user["id"]] = [];

		let obj = this.mapUserToPrmQualityResults[user["id"]].find((result) => {
			return result["prm"]["id"] === _prm["id"] && result["property"] === functionKey; 
		});

		if (obj === undefined) {
			let calcFunc: (Any) => Object = this.getCalcFunction(functionKey);

			obj = {prm: _prm, property: functionKey, value: calcFunc(_prm)};
			this.mapUserToPrmQualityResults[user["id"]].push(obj);
		}

		rtn = obj["value"];

		return rtn;
	}

	getCalcFunction(functionKey) : (Any) => Promise<Object>  { /* 'Any' here is a Prm object */
		return this.mapPropertyKeyToCalcFunction.find((propKeyToFunctionObj) => {
				return (functionKey === propKeyToFunctionObj["property"]);
			})["func"];
	}

	getQualityValue(_prm, functionKey) {
		let user = this._userService.getCurrentUser();
		if (this.mapp[user["id"]] === undefined) {
			this.mapp[user["id"]] = [];
		}

		let obj = this.mapp[user["id"]].find((obj) => { return obj["prm"]["id"] === _prm["id"] && obj["property"] === functionKey; });

		if (obj === undefined) {
			this.getQualityValuePromise(_prm, functionKey).then((data) => {
				obj = {prm: _prm, property: functionKey, value: data};
				this.mapp[user["id"]].push(obj);
			});
		}

		return obj ? obj["value"] : undefined;
	}
}
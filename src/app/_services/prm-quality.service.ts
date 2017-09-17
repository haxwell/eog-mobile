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
	}

	definePrmQualityCalculationFunction(key, _func) {
		this.mapPropertyKeyToCalcFunction.push({property: key, func: _func});
	}

	initPrmQualityCalculationFunctions() {
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
						resolve(data.some((obj) => { return obj["promise"]["id"] === prm["id"]; }));
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
			this._constants.FUNCTION_KEY_PRM_IS_REQUESTABLE, 
			(prm) => {
				return new Promise((resolve, reject) => {
					resolve( 	(this.getQualityValue(prm, this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS) === true) &&
							(!this.getQualityValue(prm, this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM) === true) && 
							(this.getQualityValue(prm, this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS) === true) && 
							(this.getQualityValue(prm, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE) === true || 
								this.getQualityValue(prm, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE) === null));
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
			let calcFunc: (Any) => Object = this.mapPropertyKeyToCalcFunction.find((propKeyToFunctionObj) => {
				return (functionKey === propKeyToFunctionObj["property"]);
			})["func"];

			obj = {prm: _prm, property: functionKey, value: calcFunc(_prm)};
			this.mapUserToPrmQualityResults[user["id"]].push(obj);
		}

		rtn = obj["value"];

		return rtn;
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
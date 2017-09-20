import { Injectable } from '@angular/core';

import { UserService } from './user.service'
import { PointsService } from './points.service'
import { RecommendationService } from './recommendation.service'
import { RequestsService } from './requests.service'
import { GeneralQualityService } from './general-quality.service'

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

export class PrmQualityService extends GeneralQualityService {
	
	constructor(protected _pointsService: PointsService,
				protected _recommendationService: RecommendationService,
				protected _requestsService: RequestsService,
				protected _userService: UserService,
				protected _constants: Constants) {

		super(_userService, _constants);
	}

	getQualityValue(_domainObj, functionKey): any {
		return super.getQualityValue(_domainObj, functionKey); // can I avoid doing this? Why isn't the parent method just called automagically?
	}

	init() {
		let self = this;
		this.addQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS, 
			(prm) => {
				return new Promise((resolve, reject) => {
					this._pointsService.getCurrentAvailableUserPoints().then((data) => {
						resolve(prm["requiredPointsQuantity"] <= data);
					});
				})
			}); 

		this.addQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM, 
			(prm) => {
				return new Promise((resolve, reject) => {
					// TODO: This method will be renamed getOutgoingRequestsForCurrentUser()
					this._requestsService.getModelForOutgoing().then((data: Array<Object>) => {
						resolve(data.some((obj) => { return obj["prm"]["id"] === prm["id"]; }));
					});
				})
			});

		this.addQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS, 
			(prm) => {
				return new Promise((resolve, reject) => {
					this._recommendationService.getUserHasNecessaryRecommendations(prm).then((data) => {
						resolve(data);
					});
				})
			});

		this.addQualityCalculationFunction(
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

		this.addQualityCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_PRM, 
			(prm) => {
				return new Promise((resolve, reject) => {
					this._requestsService.getArchivedUserRequestsForPrm(prm).then((data: Array<Object>) => {
						resolve(data.length > 0);
					});
				})
			});

		this.addQualityCalculationFunction(
			this._constants.FUNCTION_KEY_PRM_REQUIRES_RECOMMENDATIONS, 
			(prm) => {
				return new Promise((resolve, reject) => {
					resolve(prm["requiredUserRecommendations"] !== undefined && prm["requiredUserRecommendations"].length > 0);
				});
			});

		this.addQualityCalculationFunction(
			self._constants.FUNCTION_KEY_PRM_IS_REQUESTABLE, 
			(prm) => {
				return new Promise((resolve, reject) => {
					let calcFunc1: (Number) => Promise<Object> = 
						self.getCalcFunctionObject(this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS)["func"];

					calcFunc1(prm).then((data1) => {
						if (data1 === true) {
							self.getCalcFunctionObject(self._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS)["func"](prm).then((data2) => {
								if (data2 === true) {
									self.getCalcFunctionObject(self._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM)["func"](prm).then((data3) => {
										if (data3 === false) {
											self.getCalcFunctionObject(self._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE)["func"](prm).then((data4) => {
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
}
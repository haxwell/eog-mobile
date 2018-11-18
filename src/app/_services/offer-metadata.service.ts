import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular'

import { UserService } from './user.service'
import { PointsService } from './points.service'
import { RecommendationService } from './recommendation.service'
import { RequestsService } from './requests.service'
import { DomainObjectMetadataService } from './domain-object-metadata.service'

import { Constants } from '../../_constants/constants'

import Moment from 'moment'

@Injectable()
export class OfferMetadataService extends DomainObjectMetadataService {
	
	constructor(protected _pointsService: PointsService,
				protected _recommendationService: RecommendationService,
				protected _requestsService: RequestsService,
				protected _userService: UserService,
				protected _constants: Constants,
				private _events: Events) {

		super(_userService, _constants);

		this._events.subscribe('request:saved', (request) => {
			this._recommendationService.init();
			this._pointsService.init();
		});
	}

	getMetadataValue(_domainObj, functionKey): any {
		let rtn = super.getMetadataValue(_domainObj, functionKey); // can I avoid doing this? Why isn't the parent method just called automagically?
		return rtn;
	}

	// TODO, the User object needs to be a type, so that I can have two methods here. markDirty(domainObject), and markDirty(User, domainObject)
	//  without the type, it can't tell, if one parameter is dropped, which method to call. Knowing that the first param was a User, I think would
	//  help.
	markDirty(params) {
		return super.markDirty(params); // can I avoid doing this? Why isn't the parent method just called automagically?
	}

	reset() {
		super.init();
	}

	init() {
		let self = this;

		super.init();

		this.addMetadataCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS, 
			(offer) => {
				return new Promise((resolve, reject) => {
					this._pointsService.getCurrentAvailableUserPoints().then((data) => {
						resolve(offer["requiredPointsQuantity"] <= data);
					});
				})
			}); 

		this.addMetadataCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_OFFER,
			(offer) => {
				return new Promise((resolve, reject) => {
					if (offer["id"] === undefined)
						resolve(false);
					else {
						this._requestsService.getOutgoingRequestsForCurrentUser().then((data: Array<Object>) => {
							let rsv = data.some((obj) => { return obj["offer"]["id"] === offer["id"]; });
							resolve(rsv);
						});
					}
				})
			});

		this.addMetadataCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS, 
			(offer) => {
				return new Promise((resolve, reject) => {
					this._recommendationService.getUserHasNecessaryRecommendations(offer).then((data) => {
						resolve(data);
					});
				})
			});

		this.addMetadataCalculationFunction(
			this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE, 
			(offer) => {
				return new Promise((resolve, reject) => {
					if (offer["id"] === undefined)
						resolve(null);
					else {
						this._requestsService.getArchivedUserRequestsForOffer(offer).then((archivedRequests: Array<Object>) => {
							if (archivedRequests.length > 0) {
								resolve(archivedRequests.some((request) => {
									let canRequestAgainDate = request["canRequestAgainDate"];
									console.log("request " + request["id"] + " canRequestAgainDate = [" + canRequestAgainDate + "]");
									return (Moment(canRequestAgainDate) < Moment(new Date().getTime()));
									}));
							} else
								resolve(null); // there is no CAN_REQUEST_AGAIN_DATE for this offer and user
						});
					}
				})
			});

		this.addMetadataCalculationFunction(
			this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_OFFER, 
			(offer) => {
				return new Promise((resolve, reject) => {
					if (offer["id"] === undefined)
						resolve(false);
					else {					
						this._requestsService.getArchivedUserRequestsForOffer(offer).then((data: Array<Object>) => {
							resolve(data.length > 0);
						});
					}
				})
			});

		this.addMetadataCalculationFunction(
			this._constants.FUNCTION_KEY_OFFER_REQUIRES_RECOMMENDATIONS, 
			(offer) => {
				return new Promise((resolve, reject) => {
					resolve(offer["requiredUserRecommendations"] !== undefined && offer["requiredUserRecommendations"].length > 0);
				});
			});

		this.addMetadataCalculationFunction(
			self._constants.FUNCTION_KEY_OFFER_IS_REQUESTABLE, 
			(offer) => {
				return new Promise((resolve, reject) => {

					let user = this._userService.getCurrentUser();
					if (offer["userId"] !== user["id"]) {

						let calcFunc1: (Number) => Promise<Object> = 
							self.getCalcFunctionObject(this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS)["func"];

						calcFunc1(offer).then((data1) => {
							if (data1 === true) {
								self.getCalcFunctionObject(self._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS)["func"](offer).then((data2) => {
									if (data2 === true) {
										self.getCalcFunctionObject(self._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_OFFER)["func"](offer).then((data3) => {
											if (data3 === false) {
												self.getCalcFunctionObject(self._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE)["func"](offer).then((data4) => {
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
					}
					else
						resolve(false);

				});
			});

	}
}
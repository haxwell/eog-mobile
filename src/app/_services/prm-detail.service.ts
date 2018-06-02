import { Injectable } from '@angular/core';

import { PrmMetadataService } from './prm-metadata.service';
import { PointsService } from './points.service';
import { RecommendationService } from './recommendation.service';
import { UserService } from './user.service';

import { Constants } from '../../_constants/constants';

@Injectable()
export class PrmDetailService {
	
	constructor(private _prmMetadataService: PrmMetadataService,
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService,
				private _userService: UserService,
				private _constants: Constants) {

	}

	getPrmDetailMessages(_prm) {
		let _msgs = [];

		// Only return detail messages if the promise exists, and belongs to another user.
		
		if (_prm !== undefined && _prm["userId"] !== this._userService.getCurrentUser()["id"]) {
			let self = this;

			this._prmMetadataService.getMetadataValue(_prm, this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM).then((bool) => {
				if (bool === true)
					_msgs.push({type: 'alreadyRequested', msg: 'You have already requested this Promise.'});			
			})

			this._prmMetadataService.getMetadataValue(_prm, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE).then((bool) => {
				if (bool === false)
					_msgs.push({type: 'timeRemaining', msg: 'The author set a time limit before you can request this Promise again. You still have time remaining.'});
			}) 
				
			this._prmMetadataService.getMetadataValue(_prm, this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS).then((bool) => {
				if (bool === false) {
					this._pointsService.getCurrentAvailableUserPoints().then((data) => {
						_msgs.push({type: 'points', msg: (_prm["requiredPointsQuantity"] - data) + ' more points'});
					});
				}
			})

			this._prmMetadataService.getMetadataValue(_prm, this._constants.FUNCTION_KEY_PRM_REQUIRES_RECOMMENDATIONS).then((bool) => {
				if (bool === true) {
					this._prmMetadataService.getMetadataValue(_prm, this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS).then((bool2) => {
						if (bool2 === false) {
							let tmpReqdRecs = _prm["requiredUserRecommendations"].slice();
							self._recommendationService.getIncomingRecommendations().then((list: Array<Object>) => {

								// inefficient O(n2) algorithm.. but the lists should 
								// be relatively short, so its kinda (kinda) okay.
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
					}) 	
				}
			}) 
		}

		return _msgs;
	}
}
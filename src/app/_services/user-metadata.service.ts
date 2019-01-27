import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'

import { UserService } from './user.service';

import { Constants } from '../../_constants/constants'
import { RecommendationService } from './recommendation.service'
import { PointsService } from './points.service'
import { DomainObjectMetadataService } from './domain-object-metadata.service'


@Injectable()
export class UserMetadataService extends DomainObjectMetadataService {
	
	constructor(protected _userService: UserService,
				protected _pointsService: PointsService,
				protected _recommendationService: RecommendationService,
				protected _constants: Constants,
				protected _events: Events) {

		super(_userService, _constants);				

		this._events.subscribe('points:sent', (data) => {
			this._userService.getUser(data["receivingUserId"]).then((user) => {
				this.markDirty({domainObject: user});
			});
		});

		this._events.subscribe('recommendation:sent', (data) => {
			this._userService.getUser(data["receivingUserId"]).then((user) => {
				this.markDirty({domainObject: user});
			});
		});
	}

	getMetadataValue(_domainObj, functionKey): any {
		return super.getMetadataValue(_domainObj, functionKey); // can I avoid doing this? Why isn't the parent method just called automagically?
	}

	// TODO, the User object needs to be a type, so that I can have two methods here. markDirty(domainObject), and markDirty(User, domainObject)
	//  without the type, it can't tell, if one parameter is dropped, which method to call. Knowing that the first param was a User, I think would
	//  help.
	markDirty(params) {
		return super.markDirty(params); // can I avoid doing this? Why isn't the parent method just called automagically?
	}

	init() {
		let self = this;
		self.addMetadataCalculationFunction(
			self._constants.FUNCTION_KEY_CAN_SEND_POINT_TO_USER, 
			(userId: number) => {
				return new Promise((resolve, reject) => {
					this._pointsService.isCurrentUserAbleToSendAPointTo(userId).then((bool) => {
						resolve(bool);
					});
				});
			});


		self.addMetadataCalculationFunction(
			self._constants.FUNCTION_KEY_CAN_SEND_RECOMMENDATION_TO_USER, 
			(userId: number) => {
				return new Promise((resolve, reject) => {
					this._recommendationService.isCurrentUserAbleToSendARecommendationTo(userId).then((bool) => {
						resolve(bool);
					});
				});
			});
	}

}
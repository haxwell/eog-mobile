import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';



@Injectable()
export class RecommendationService { 
	
	constructor(private _apiService: ApiService, private _userService: UserService, private _events: Events) { }

	recommendationsIncoming = undefined;
	recommendationsOutgoing = undefined;
	
	incomingRecs = {};
	outgoingRecs = {};
	mapUserToArrayOfRecommendations = {};

	init() {
		this.incomingRecs = {};
		this.outgoingRecs = {};
		this.mapUserToArrayOfRecommendations = {};
	}

	getInitializationPromiseObject(_userId?) {
		if (_userId === undefined)
			_userId = this._userService.getCurrentUser()["id"];

		if (this.mapUserToArrayOfRecommendations[_userId] === undefined) {
			this.mapUserToArrayOfRecommendations[_userId] = null;
			this.mapUserToArrayOfRecommendations[_userId] = this.getPromiseWhichSetsArraysOfUserRecommendations(_userId);
		}

		return this.mapUserToArrayOfRecommendations[_userId];
	}

	getPromiseWhichSetsArraysOfUserRecommendations(_userId) {
		let self = this;
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/user/" + _userId + "/recommendations/incoming";
			let numTimesAPICallHasReturned = 0;

			this._apiService.get(url).subscribe((data) => {
				self.incomingRecs[_userId] = JSON.parse(data["_body"]);

				if (++numTimesAPICallHasReturned >= 2)
					resolve(true);
			}, (err) => {
				reject(err);
			});

			url = environment.apiUrl + "/api/user/" + _userId + "/recommendations/outgoing";
			this._apiService.get(url).subscribe((data) => {
				self.outgoingRecs[_userId] = JSON.parse(data["_body"]);

				if (++numTimesAPICallHasReturned >= 2)
					resolve(true);
			}, (err) => {
				reject(err);
			});
		});
	}

	getUserHasNecessaryRecommendations(_offer) {
		let self = this;

		let _userId = this._userService.getCurrentUser()["id"];

		return new Promise((resolve, reject) => {
			this.getInitializationPromiseObject().then(() => {
				let count = 0;

				self.getIncomingRecommendations().then((incomingRecommendations: Array<Object>) => {
					_offer["requiredUserRecommendations"].map((obj) => {
						if (incomingRecommendations.some((obj2) => { return obj2["escrowedRequestId"] === null && (obj2["providingUserId"] === obj["requiredRecommendUserId"] || _userId === obj["requiredRecommendUserId"]); }))
							count++;
					});

					resolve((count === _offer["requiredUserRecommendations"].length));							
				});
			});
		})
	}

	getIncomingRecommendations(_userId?) {
		let self = this;

		if (_userId === undefined)
			_userId = this._userService.getCurrentUser()["id"];

		return new Promise((resolve, reject) => {
			this.getInitializationPromiseObject(_userId).then(() => {
				resolve( self.incomingRecs[_userId]);
			});
		});
	}

	getOutgoingRecommendations(_userId?) {
		let self = this;

		if (_userId === undefined)
			_userId = this._userService.getCurrentUser()["id"];

		return new Promise((resolve, reject) => {
			this.getInitializationPromiseObject(_userId).then(() => {
				resolve( self.outgoingRecs[_userId] );
			});
		});
	}

	sendARecommendationToAUser(receivingUserId: number) {
		let self = this;
		return new Promise((resolve, reject) => {
			let user = self._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + receivingUserId + "/recommendations/receive";
			let data = "sendingUserId=" + user["id"];
			self._apiService.post(url, data)
			.subscribe((obj) => {
				self._events.publish('recommendation:sent', {receivingUserId: receivingUserId})
				resolve(JSON.parse(obj["_body"]));
			}, (err) => {
				reject(err);
			});
		});
	}

	// TODO: Does it make sense to move this to the metadataService? If so, what type stuff stays in this service?
	isCurrentUserAbleToSendARecommendationTo(receivingUserId: number) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			
			if (receivingUserId !== user["id"]) {
				let url = environment.apiUrl + "/api/user/" + receivingUserId + "/recommendations/receive/" + user["id"];
				this._apiService.get(url).subscribe((obj) => {
					resolve(JSON.parse(obj["_body"]));
				}, (err) => {
					reject(err);
				});
			}
			else {
				resolve(false);
			}
		});
	}
	
}
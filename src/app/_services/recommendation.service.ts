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

	getInitializationPromiseObject(_user?) {
		if (_user === undefined)
			_user = this._userService.getCurrentUser();

		if (this.mapUserToArrayOfRecommendations[_user["id"]] === undefined) {
			this.mapUserToArrayOfRecommendations[_user["id"]] = null;
			this.mapUserToArrayOfRecommendations[_user["id"]] = this.getPromiseWhichSetsArraysOfRecommendations(_user);
		}

		return this.mapUserToArrayOfRecommendations[_user["id"]];
	}

	getPromiseWhichSetsArraysOfRecommendations(_user) {
		let self = this;
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/user/" + _user["id"] + "/recommendations/incoming";
			let numTimesAPICallHasReturned = 0;

			this._apiService.get(url).subscribe((data) => {
				self.incomingRecs[_user["id"]] = JSON.parse(data["_body"]);

				if (++numTimesAPICallHasReturned >= 2)
					resolve(true);
			});

			url = environment.apiUrl + "/api/user/" + _user["id"] + "/recommendations/outgoing";
			this._apiService.get(url).subscribe((data) => {
				self.outgoingRecs[_user["id"]] = JSON.parse(data["_body"]);

				if (++numTimesAPICallHasReturned >= 2)
					resolve(true);
			});
		});
	}

	getUserHasNecessaryRecommendations(_prm) {
		let self = this;

		return new Promise((resolve, reject) => {
			this.getInitializationPromiseObject().then(() => {
				let count = 0;

				self.getIncomingRecommendations().then((incomingRecommendations: Array<Object>) => {
					_prm["requiredUserRecommendations"].map((obj) => {
						if (incomingRecommendations.some((obj2) => { return obj2["escrowedRequestId"] === null && obj2["providingUserId"] === obj["requiredRecommendUserId"]; }))
							count++;
					});

					resolve((count === _prm["requiredUserRecommendations"].length));							
				});
			});
		})
	}

	getIncomingRecommendations(_user?) {
		let self = this;

		if (_user === undefined)
			_user = this._userService.getCurrentUser();

		return new Promise((resolve, reject) => {
			this.getInitializationPromiseObject(_user).then(() => {
				resolve( self.incomingRecs[_user["id"]] );
			});
		});
	}

	getOutgoingRecommendations(_user?) {
		let self = this;

		if (_user === undefined)
			_user = this._userService.getCurrentUser();

		return new Promise((resolve, reject) => {
			this.getInitializationPromiseObject(_user).then(() => {
				resolve( self.outgoingRecs[_user["id"]] );
			});
		});
	}

	sendARecommendationToAUser(receivingUserId) {
		let self = this;
		return new Promise((resolve, reject) => {
			let user = self._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + receivingUserId + "/recommendations/receive";
			let data = "sendingUserId=" + user["id"];
			self._apiService.post(url, data)
			.subscribe((obj) => {
				self._events.publish('recommendation:sent', {receivingUserId: receivingUserId})
				resolve(JSON.parse(obj["_body"]));
			});
		});
	}

	// TODO: Does it make sense to move this to the metadataService? If so, what type stuff stays in this service?
	isCurrentUserAbleToSendARecommendationTo(receivingUserId) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + receivingUserId + "/recommendations/receive/" + user["id"];
			this._apiService.get(url)
			.subscribe((obj) => {
				resolve(JSON.parse(obj["_body"]));
			});
		});
	}
	
}
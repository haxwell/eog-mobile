import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class PointsService { 
	
	constructor(private _apiService: ApiService, 
				private _userService: UserService, 
				private _events: Events) {

	}

	currentAvailableUserPointsPromise = undefined;
	currentUserPointsAsSumPromise = undefined;

	init() {
		this.currentUserPointsAsSumPromise = undefined;
		this.currentAvailableUserPointsPromise = undefined;
	}

	getCurrentAvailableUserPoints() {
		if (this.currentAvailableUserPointsPromise === undefined)
			this.currentAvailableUserPointsPromise = new Promise((resolve, reject) => {
				let user = this._userService.getCurrentUser();
				let url = environment.apiUrl + "/api/user/" + user["id"] + "/points";
				this._apiService.get(url)
				.subscribe((obj) => {
					let rtn = JSON.parse(obj["_body"]);

					let sum = 0;
					rtn.map((obj) => { if (obj["escrowedRequestId"] === null) sum += obj["quantity"]; });

					resolve(sum);
				});	
			});

		return this.currentAvailableUserPointsPromise;
	}

	getCurrentUserPointsAsSum() {
		if (this.currentUserPointsAsSumPromise === undefined) 
			this.currentUserPointsAsSumPromise = new Promise((resolve, reject) => {
				let user = this._userService.getCurrentUser();
				let url = environment.apiUrl + "/api/user/" + user["id"] + "/points";
				this._apiService.get(url)
				.subscribe((obj) => {
					let rtn = JSON.parse(obj["_body"]);

					let sum = 0;
					rtn.map((obj) => { sum += obj["quantity"]; });

					resolve(sum);
				});	
			});

		return this.currentUserPointsAsSumPromise;
	}

	sendAPointToAUser(receivingUserId) {
		let self = this;
		return new Promise((resolve, reject) => {
			let user = self._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + receivingUserId + "/points/receive";
			let data = "sendingUserId=" + user["id"] + "&quantity=1";
			self._apiService.post(url, data)
			.subscribe((obj) => {
				self._events.publish("points:sent", {receivingUserId: receivingUserId});
				resolve(JSON.parse(obj["_body"]));
			});
		});
	}

	isCurrentUserAbleToSendAPointTo(receivingUserId) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + receivingUserId + "/points/receive/" + user["id"];
			this._apiService.get(url)
			.subscribe((obj) => {
				resolve(JSON.parse(obj["_body"]));
			});
		});
	}
}


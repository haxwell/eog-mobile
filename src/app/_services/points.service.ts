import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class PointsService { 
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getCurrentAvailableUserPoints() {
		return new Promise((resolve, reject) => {
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
	}

	getCurrentUserPointsAsSum() {
		return new Promise((resolve, reject) => {
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
	}

	getUserHasSufficientPointsGivenRules(thing, userPoints) {
		return (thing["requiredPointsQuantity"] <= userPoints);
	}
}
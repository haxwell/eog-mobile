import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class RecommendationService { 
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	initialized = false;
	recommendationsIncoming = undefined;
	recommendationsOutgoing = undefined;
	initPromise = undefined;

	init() {
		this.initPromise = new Promise((resolve, reject) => {
			let self = this;
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/recommendations/incoming";
			let resolutionCount = 0;

			this._apiService.get(url).subscribe((data) => {
				self.recommendationsIncoming = JSON.parse(data["_body"]);
				if (++resolutionCount >= 2)
					resolve(true);
			});

			url = environment.apiUrl + "/api/user/" + user["id"] + "/recommendations/outgoing";

			this._apiService.get(url).subscribe((data) => {
				self.recommendationsOutgoing = JSON.parse(data["_body"]);
				if (++resolutionCount >= 2)
					resolve(true);
			});
		});

		return this.initPromise;
	}

	getUserHasNecessaryRecommendations(thing) {
		let self = this;

		return new Promise((resolve, reject) => {
			this.initPromise.then(() => {
				let count = 0;

				thing["requiredUserRecommendations"].map((obj) => {
					if (self.recommendationsIncoming.some((obj2) => { return obj2["providingUserId"] === obj["requiredRecommendUserId"]; }))
						count++;
				});

				resolve((count === thing["requiredUserRecommendations"].length));
			});
		})
	}

	getIncomingRecommendations() {
		let self = this;
		return new Promise((resolve, reject) => {
			this.initPromise.then(() => {
				resolve(self.recommendationsIncoming);
			})
		});
	}

	getOutgoingRecommendations() {
		let self = this;
		return new Promise((resolve, reject) => {
			this.initPromise.then(() => {
				resolve(self.recommendationsOutgoing);
			})
		});
	}
	
}
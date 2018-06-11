import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';

import { environment } from '../../../_environments/environment';

@Injectable()
export class HomeService {
	
	mostRecentlyCreatedPromises = undefined;
	mostRecentlyCreatedPromisesPromise = undefined;

	constructor(private _apiService: ApiService, private _userService: UserService) {

	}

	init() {
		this.mostRecentlyCreatedPromises = undefined;
		this.mostRecentlyCreatedPromisesPromise = undefined;
	}

	getMostRecentlyCreatedPromises() {
		let self = this;
		let rtn = undefined; 

		if (self.mostRecentlyCreatedPromises === undefined) {
			self.mostRecentlyCreatedPromises = null;

			rtn = new Promise((resolve, reject) => {
				let url = environment.apiUrl + "/api/promises/recent?count=3&userId=" + self._userService.getCurrentUser()["id"];
				this._apiService.get(url).subscribe((data) => {
					self.mostRecentlyCreatedPromises = JSON.parse(data["_body"]);
					resolve(self.mostRecentlyCreatedPromises);
				});
			})

			self.mostRecentlyCreatedPromisesPromise = rtn;
		} else {
			rtn = self.mostRecentlyCreatedPromisesPromise;
		}
		
		return rtn;
	}

}

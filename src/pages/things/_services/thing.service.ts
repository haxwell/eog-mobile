import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';

import { environment } from '../../../_environments/environment';

@Injectable()
export class ThingService {
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getDefaultModel() { 
		let user = this._userService.getCurrentUser();
		let rtn = {};

		rtn["userId"] = user["id"];
		rtn["description"] = '';
		rtn["title"] = '';
		rtn["keywords"] = [];

		// TODO: add default points information

		return rtn;
	}

	get(thingId) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/things/" + thingId; 
			this._apiService.get(url)
			.subscribe((thingObj) => {
				resolve(JSON.parse(thingObj["_body"]));
			});
		});
	}
}

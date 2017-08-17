import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class PointsService { // TODO: should this be named RulesService??
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getCurrentUserPoints() {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/points";
			this._apiService.get(url)
			.subscribe((obj) => {
				let rtn = JSON.parse(obj["_body"]);
				resolve(rtn);
			});	
		});
	}

	// be given an array of rules
	//  and then call for the points of the current user
	getUserHasSufficientPointsGivenRules(rulesArray, userPoints) {
		let arr = rulesArray.slice();
		let upArr = userPoints.slice();
		
		for (let x=0; x < arr.length; x++) {
			let reqdId = arr[x]["requiredUserId"];

			for (let y=0; y < upArr.length; y++) {
				if (upArr[y]["providingUserId"] === reqdId) {
					arr[x]["quantity"] -= upArr[y]["quantity"];
					upArr[y]["used"] = true;
				}
			}

			upArr = upArr.filter((obj) => { return obj["used"]; });
		}

		return arr.every((obj) => { return obj["quantity"] <= 0; });
	}
}
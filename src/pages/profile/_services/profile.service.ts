import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';

import { environment } from '../../../_environments/environment';

@Injectable()
export class ProfileService {
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getModel() {
		let user = this._userService.getCurrentUser();
		let model = {};

		model["realname"] = user["realname"];
		model["phone"] = user["phone"];
		model["email"] = user["email"];
		model["points"] = {"points" : 0};

		let userKeywords = undefined;

		let self = this;
		let url = environment.apiUrl + "/api/user/" + user["id"] + "/keywords";
		this._apiService.get(url).subscribe((keywordsObj) => {
			model["keywords"] = JSON.parse(keywordsObj["_body"]);
		});

		url = environment.apiUrl + "/api/user/" + user["id"] + "/dreams";
		this._apiService.get(url).subscribe((dreamsObj) => {
			model["dreams"] = JSON.parse(dreamsObj["_body"]);
		});

		url = environment.apiUrl + "/api/user/" + user["id"] + "/things";
		this._apiService.get(url).subscribe((thingsObj) => {
			model["things"] = JSON.parse(thingsObj["_body"]);
		});

		url = environment.apiUrl + "/api/user/" + user["id"] + "/points";
		this._apiService.get(url).subscribe((pointsObj) => {
			let coll = JSON.parse(pointsObj["_body"]);

			coll.map((obj) => model["points"]["points"] += obj["quantity"]);

			model["points"]["coll"] = coll;
		});

		return model;
	}
}
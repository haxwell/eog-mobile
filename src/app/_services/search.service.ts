import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class SearchService {
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	searchThings(qStr) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/things?q=" + qStr;
			this._apiService.get(url)
			.subscribe((searchObj) => {
				let rtn = JSON.parse(searchObj["_body"]);
				resolve(rtn.filter((obj) => { return obj["userId"] !== user["id"]; }));
			});
		});
	}

	searchUsers(qStr) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/users?q=" + qStr;
			this._apiService.get(url)
			.subscribe((searchObj) => {
				let rtn = JSON.parse(searchObj["_body"]);
				resolve(rtn);
			});
		});
	}
}

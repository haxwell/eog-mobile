import { Injectable } from '@angular/core';

import { LocalStorageService } from 'angular-2-local-storage';

import { ApiService } from './api.service';
import { environment } from '../../_environments/environment';

@Injectable()
export class UserService {
	promise = undefined;
	
	constructor(private _apiService: ApiService, private _localStorageService: LocalStorageService) { }

	getCurrentUser() {
		return this._localStorageService.get('user');		
	}

	verifyAndLoginUser(username, password) {
		let self = this;
		let url = environment.apiUrl + "/api/verifyCredentials";

		self.promise = new Promise(
			(resolve, reject) => {
				this._apiService.get(url).subscribe(
					(userObj) => { 
						console.log("Credentials Valid!");
						resolve(JSON.parse(userObj["_body"]));
					 });
			});

		return self.promise;
	}

	save(user) {
		let self = this;
		let url = environment.apiUrl + "/api/users";

		let data = 
			"username="+user.name+
			"&password="+user.password+
			"&email="+user.email+
			"&phone="+user.phone+
			"&realname="+user.realname;

		self.promise = new Promise(
			(resolve, reject) => {
				this._apiService.post(url, data).subscribe(
					(userId) => { 
						console.log("Credentials Saved! " + JSON.stringify(data));
						resolve(JSON.parse(userId["_body"]));
					 });
			});

		return self.promise;
	}
}
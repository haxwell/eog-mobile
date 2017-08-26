import { Injectable } from '@angular/core';

import { LocalStorageService } from 'angular-2-local-storage';

import { ApiService } from './api.service';
import { environment } from '../../_environments/environment';

@Injectable()
export class UserService {
	promise = undefined;
	users = {};
	usersPromise = {};

	constructor(private _apiService: ApiService, private _localStorageService: LocalStorageService) { }

	getUser(userId, force?: boolean) {
		let self = this;
		let rtn = undefined;

		if (self.users[userId] === undefined || force) {
			self.users[userId] = null;
			rtn = new Promise((resolve, reject) => {
				let url = environment.apiUrl + "/api/users/" + userId;			
				this._apiService.get(url).subscribe(
					(userObj) => { 
						self.users[userId] = JSON.parse(userObj["_body"]);
						resolve(self.users[userId]);
					 });
			});

			self.usersPromise[userId] = rtn;
		} else {
			rtn = self.usersPromise[userId];
		};

		return rtn;
	}

	getCurrentUser() {
		return this._localStorageService.get('user');
	}

	setCurrentUser(user) {
		this._localStorageService.set('user', user);
	}

	verifyAndLoginUser(username, password) {
		let self = this;
		let url = environment.apiUrl + "/api/verifyCredentials";

		self.promise = new Promise(
			(resolve, reject) => {
				this._apiService.getWithUsernameAndPassword(url, username, password).subscribe(
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
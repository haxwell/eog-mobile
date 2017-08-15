import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';

import { LocalStorageService } from 'angular-2-local-storage';

import { environment } from '../../_environments/environment';

@Injectable()
export class UserService {
	promise = undefined;
	
	constructor(private _http: Http, private _localStorageService: LocalStorageService) { }

	getCurrentUser() {
		return this._localStorageService.get('user');		
	}

	getHeaders(username, password) {
		let headers: Headers = new Headers(); // TO ANSWER: Why do we use new here, but inject the others?
		headers.append("Authorization", "Basic " + btoa(username + ":" + password)); 
		headers.append("Content-Type", "application/x-www-form-urlencoded");

		return headers;
	}

	verifyAndLoginUser(username, password) {
		let self = this;
		let url = environment.apiUrl + "/api/verifyCredentials";

		let headers: Headers = this.getHeaders(username, password);

		self.promise = new Promise(
			(resolve, reject) => {
				this._http.get(url, {headers: headers}).subscribe(
					(userObj) => { 
						console.log("Credentials Valid!");
						resolve(JSON.parse(userObj["_body"]));
					 });
			});

		return self.promise;
	}

	saveCurrentUser(user) {
		let self = this;
		let url = environment.apiUrl + "/api/user";

		let headers: Headers = this.getHeaders(user.name, user.password);

		let data: String = 
			"username="+user.name+
			"&password="+user.password+
			"&email="+user.email+
			"&phone="+user.phone+
			"&realname="+user.realname;

		self.promise = new Promise(
			(resolve, reject) => {
				this._http.post(url, data, {headers: headers}).subscribe(
					(userId) => { 
						console.log("Credentials Saved! " + JSON.stringify(data));
						resolve(JSON.parse(userId["_body"]));
					 });
			});

		return self.promise;
	}
}
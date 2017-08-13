import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';

import { UserService } from './user.service';

@Injectable()
export class ApiService {
	
	constructor(private _http: Http, private _userService: UserService) { }

	getHeaders(username, password) {
		let headers: Headers = new Headers(); // TO ANSWER: Why do we use new here, but inject the others?
		headers.append("Authorization", "Basic " + btoa(username + ":" + password)); 
		headers.append("Content-Type", "application/x-www-form-urlencoded");

		return headers;
	}

	get(url: string) {
		let user = this._userService.getCurrentUser();

	    let username: string = user["name"];
	    let password: string = user["password"];

		let headers: Headers = this.getHeaders(username, password);

		return this._http.get(url, {headers: headers});
	}

	post(url: string, data: string) {
		let user = this._userService.getCurrentUser();

	    let username: string = user["name"];
	    let password: string = user["password"];

		let headers: Headers = this.getHeaders(username, password);

	    return this._http.post(url, data, {headers: headers});
	}
}
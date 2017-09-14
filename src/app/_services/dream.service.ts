import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class DreamService {
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getDefaultModel() { 
		let user = this._userService.getCurrentUser();
		let rtn = {};

		rtn["userId"] = user["id"];
		rtn["description"] = '';
		rtn["title"] = '';
		rtn["keywords"] = [];

		return rtn;
	}

	get(dreamId) {
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/dreams/" + dreamId; 
			this._apiService.get(url)
			.subscribe((data) => {
				resolve(JSON.parse(data["_body"]));
			});
		});
	}

	getDreamsForCurrentUser() {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/dreams";
			this._apiService.get(url)
			.subscribe((obj) => {
				let rtn = JSON.parse(obj["_body"]);
				resolve(rtn);
			});
		});
	}

	delete(model) {
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/dreams/" + model["id"];
			this._apiService.delete(url)
			.subscribe((resp) => {
				console.log(JSON.parse(resp["_body"]));
				resolve(JSON.parse(resp["_body"]));
			});
		});	
	}

	save(model) {
		let data = this.JSON_to_URLEncoded(model, undefined, undefined);
		console.log(data);

		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/dreams";
			this._apiService.post(url, data)
			.subscribe((resp) => {
				console.log(JSON.parse(resp["_body"]));
				resolve(JSON.parse(resp["_body"]));
			});
		});
	}

	JSON_to_URLEncoded(element,key,list){
  		var list = list || [];
  		if(typeof(element)=='object'){
    		for (var idx in element)
      			this.JSON_to_URLEncoded(element[idx],key?key+'['+idx+']':idx,list);
  		} else {
    		list.push(key+'='+encodeURIComponent(element));
  		}
  		
  		return list.join('&');
	}

}

import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';

import { environment } from '../../../_environments/environment';

@Injectable()
export class PrmService {
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getDefaultModel() { 
		let user = this._userService.getCurrentUser();
		let rtn = {};

		rtn["userId"] = user["id"];
		rtn["description"] = '';
		rtn["title"] = '';
		rtn["keywords"] = [];
		rtn["requiredPointsQuantity"] = 0;
		rtn["requiredUserRecommendations"] = [];

		return rtn;
	}

	get(prmId) {
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/promises/" + prmId; 
			this._apiService.get(url)
			.subscribe((prmObj) => {
				resolve(JSON.parse(prmObj["_body"]));
			});
		});
	}

	save(model) {
		let data = this.JSON_to_URLEncoded(model, undefined, undefined);
		console.log(data);

		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/promises";
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

	delete(model) {
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/promises/" + model["id"];
			this._apiService.delete(url)
			.subscribe((resp) => {
				console.log(JSON.parse(resp["_body"]));
				resolve(JSON.parse(resp["_body"]));
			});
		});	
	}
}
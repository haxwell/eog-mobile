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
		rtn["rules"] = [];

		return rtn;
	}

	get(thingId) {
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/things/" + thingId; 
			this._apiService.get(url)
			.subscribe((thingObj) => {
				resolve(JSON.parse(thingObj["_body"]));
			});
		});
	}

	save(model) {
		let data = this.JSON_to_URLEncoded(model, undefined, undefined);
		console.log(data);

		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/things";
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

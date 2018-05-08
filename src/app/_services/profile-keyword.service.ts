import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class ProfileKeywordService { 
	
	model = undefined;

	constructor(private _apiService: ApiService, 
				private _userService: UserService) {

	}

	getModel() {
		return this.getModelByUser(this._userService.getCurrentUser());
	}

	getModelByUser(user) {
		if (this.model === undefined) {
			this.model = {}
			this.init(this.model, user);
		}

		return this.model;
	}

	init(model, user) {
		let url = environment.apiUrl + "/api/user/" + user["id"] + "/profile";
		this._apiService.get(url).subscribe((data) => {
			let obj = JSON.parse(data["_body"]);
			model["keywords"] = obj["keywords"];
			model["keywords"].sort((a, b) => { let aText = a.text.toLowerCase(); let bText = b.text.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })
		});		
	}

	save(model) {
		let self = this;
		let tmp = {keywords: this.model["keywords"]};

		let data = this.JSON_to_UrlEncoded(tmp, undefined, undefined);

		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/profile/keywords";
			self._apiService.post(url, data)
			.subscribe((resp) => {

			});
		})
	}

	JSON_to_UrlEncoded(element,key,list){
  		var list = list || [];
  		if(typeof(element)=='object'){
    		for (var idx in element)
      			this.JSON_to_UrlEncoded(element[idx],key?key+'['+idx+']':idx,list);
  		} else {
    		list.push(key+'='+encodeURIComponent(element));
  		}
  		
  		return list.join('&');
	}

}


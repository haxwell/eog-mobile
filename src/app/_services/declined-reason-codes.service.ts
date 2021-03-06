import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';


@Injectable()
export class DeclineReasonCodeService {
	
	declineReasonCodes: Array<Object>
	promise = undefined;
	
	constructor(private _apiService: ApiService) { 

	}

	init() {
		let self = this;
		self.promise = new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/declineReasonCodes";
			this._apiService.get(url).subscribe((data) => {
				self.declineReasonCodes = JSON.parse(data["_body"]);
				resolve(self.declineReasonCodes);
			}, (err) => {
				reject(err);
			});
		});

		return self.promise;
	}

	getDeclineReasonCodes() {
		if (this.promise === undefined)
			this.init();

		return this.promise;
	}
	
}

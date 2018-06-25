import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';
import { PrmModelService } from '../../../app/_services/prm-model.service';
import { FunctionPromiseService } from '../../../app/_services/function-promise.service';

import { environment } from '../../../_environments/environment';
import { Constants } from '../../../_constants/constants';

@Injectable()
export class HomeService {
	
	isMostRecentlyCreatedPromisesFuncInitialized = false;

	constructor(private _apiService: ApiService, private _userService: UserService,
				private _constants: Constants,
				private _prmModelService: PrmModelService, 
				private _functionPromiseService: FunctionPromiseService) {

	}

	init() {
		let self = this;
		self._functionPromiseService.initFunc(this._constants.FUNCTION_KEY_MOST_RECENTLY_CREATED_PROMISES_GET, (data) => {
			let userId = data['userId'];
			let count = data['count'];

			return new Promise((resolve, reject) => {
				let url = environment.apiUrl + "/api/promises/recent?count=" + count + "&userId=" + userId;
				self._apiService.get(url).subscribe((data) => {
					let prms = JSON.parse(data["_body"]);

					prms.forEach((prm) => {
						self._prmModelService.setPrmImageOrientation(prm);
					});

					resolve(prms);
				});
			})
		})

		this.isMostRecentlyCreatedPromisesFuncInitialized = true;
	}

	getMostRecentlyCreatedPromises() {
		let self = this;
		if (!self.isMostRecentlyCreatedPromisesFuncInitialized)
			self.init();

		let data = {userId: self._userService.getCurrentUser()['id'], count: 3};
		return self._functionPromiseService.get(data['userId']+"mrcp", self._constants.FUNCTION_KEY_MOST_RECENTLY_CREATED_PROMISES_GET, data);
	}
}

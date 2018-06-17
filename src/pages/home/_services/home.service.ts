import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';
import { PictureService } from '../../../app/_services/picture.service';

import { environment } from '../../../_environments/environment';
import { Constants } from '../../../_constants/constants';

@Injectable()
export class HomeService {
	
	mostRecentlyCreatedPromises = undefined;
	mostRecentlyCreatedPromisesPromise = undefined;

	constructor(private _apiService: ApiService, private _userService: UserService,
				private _pictureService: PictureService, private _constants: Constants) {

	}

	init() {
		this.mostRecentlyCreatedPromises = undefined;
		this.mostRecentlyCreatedPromisesPromise = undefined;
	}

	getMostRecentlyCreatedPromises() {
		let self = this;
		let rtn = undefined; 

		if (self.mostRecentlyCreatedPromises === undefined) {
			self.mostRecentlyCreatedPromises = null;

			rtn = new Promise((resolve, reject) => {
				let url = environment.apiUrl + "/api/promises/recent?count=3&userId=" + self._userService.getCurrentUser()["id"];
				this._apiService.get(url).subscribe((data) => {
					self.mostRecentlyCreatedPromises = JSON.parse(data["_body"]);

					// TODO: This is duplicated in prm-collection-service.ts
					self.mostRecentlyCreatedPromises.forEach((prm) => {
						self._pictureService.get(self._constants.PHOTO_TYPE_PRM, prm["id"]).then((filename) => {
							console.log("in homeService, called to get the filename for prm " + prm["id"] + ", and got " + filename)
							prm["imageFileSource"] = 'eog';
							prm["imageFileURI"] = filename;
							prm["imageFileURI_OriginalValue"] = filename;
						});
					});

					resolve(self.mostRecentlyCreatedPromises);
				});
			})

			self.mostRecentlyCreatedPromisesPromise = rtn;
		} else {
			rtn = self.mostRecentlyCreatedPromisesPromise;
		}
		
		return rtn;
	}

}

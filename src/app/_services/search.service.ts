import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { PictureService } from './picture.service';
import { PictureEXIFService } from './picture-exif.service';

import { environment } from '../../_environments/environment';
import { Constants } from '../../_constants/constants';

@Injectable()
export class SearchService {
	
	constructor(private _apiService: ApiService, private _userService: UserService,
				private _pictureService: PictureService, private _pictureEXIFService: PictureEXIFService,
				private _constants: Constants) { 

	}

	searchPrms(qStr) {
		let self = this;
		return new Promise((resolve, reject) => {
			let user = self._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/promises?q=" + qStr;
			self._apiService.get(url)
			.subscribe((searchObj) => {
				let rtn = JSON.parse(searchObj["_body"]);

				rtn = rtn.filter((obj) => { return obj["userId"] !== user["id"]; });

				// TODO: This is duplicated in prm-collection-service.ts
				rtn.forEach((prm) => {
					self._pictureService.get(self._constants.PHOTO_TYPE_PRM, prm["id"]).then((filename) => {
						console.log("in search.ts, called to get the filename for prm " + prm["id"] + ", and got " + filename)
						prm["imageFileSource"] = 'eog';
						prm["imageFileURI"] = filename;
						prm["imageFileURI_OriginalValue"] = filename;

						if (filename) {
							self._pictureEXIFService.getEXIFMetadata(filename).then((exifMetadata) => {
								prm["imageOrientation"] = exifMetadata["Orientation"];
							})
						}

					});
				});

				resolve(rtn);
			}, (err) => {
				reject(err);
			});
		});
	}

	searchUsers(qStr) {
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/users?q=" + qStr;
			this._apiService.get(url)
			.subscribe((searchObj) => {
				let rtn = JSON.parse(searchObj["_body"]);
				resolve(rtn);
			}, (err) => {
				reject(err);
			});
		});
	}
}

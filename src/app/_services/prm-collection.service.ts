import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { PictureService } from './picture.service';
import { PictureEXIFService } from './picture-exif.service';

import { environment } from '../../_environments/environment';
import { Constants } from '../../_constants/constants'

@Injectable()
export class PrmCollectionService { 

	/**
	 *
	 * Returns a collection of promises owned by the current user.
	 *
	 */
	
	model = undefined;
	force = false;

	constructor(private _apiService: ApiService, 
				private _userService: UserService,
				private _pictureService: PictureService,
				private _pictureEXIFService: PictureEXIFService,
				private _constants: Constants) {

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

	resetModel() {
		this.model = undefined;
		this.force = true;
	}

	init(model, user) {
		let self = this;
		let url = environment.apiUrl + "/api/user/" + user["id"] + "/promises";
		self._apiService.get(url).subscribe((prmsObj) => {
			model["prms"] = JSON.parse(prmsObj["_body"]);

			model["prms"].forEach((prm) => {
				self._pictureService.get(self._constants.PHOTO_TYPE_PRM, prm["id"]).then((filename) => {
					console.log("in prmCollectionService, called to get the filename for prm " + prm["id"] + ", and got " + filename)
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

			model["prms"].sort((a, b) => { let aText = a.title.toLowerCase(); let bText = b.title.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })
		});		
	}

}


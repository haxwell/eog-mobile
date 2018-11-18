import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { PictureService } from './picture.service';
import { PictureEXIFService } from './picture-exif.service';

import { environment } from '../../_environments/environment';
import { Constants } from '../../_constants/constants'

@Injectable()
export class OfferCollectionService { 

	/**
	 *
	 * Returns a collection of offers owned by the current user.
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
		let url = environment.apiUrl + "/api/user/" + user["id"] + "/offers";
		self._apiService.get(url).subscribe((offersObj) => {
			model["offers"] = JSON.parse(offersObj["_body"]);

			model["offers"].forEach((offer) => {
				self._pictureService.get(self._constants.PHOTO_TYPE_OFFER, offer["id"]).then((filename) => {
					offer["imageFileSource"] = 'eog';
					offer["imageFileURI"] = filename;
					offer["imageFileURI_OriginalValue"] = filename;

					if (filename) {
						self._pictureEXIFService.getEXIFMetadata(filename).then((exifMetadata) => {
							offer["imageOrientation"] = exifMetadata["Orientation"];
						})
					}
				});
			});

			model["offers"].sort((a, b) => { let aText = a.title.toLowerCase(); let bText = b.title.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })
		}, (err) => {
			console.log("offerCollectionService ERROR");
			console.log(JSON.stringify(err));
		});		
	}

}


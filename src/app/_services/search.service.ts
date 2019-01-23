import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { PictureService } from './picture.service';
import { PictureEXIFService } from './picture-exif.service';
import { OfferModelService } from './offer-model.service'

import { environment } from '../../_environments/environment';
import { Constants } from '../../_constants/constants';

@Injectable()
export class SearchService {
	
	constructor(private _apiService: ApiService, private _userService: UserService,
				private _pictureService: PictureService, private _pictureEXIFService: PictureEXIFService,
				private _offerModelService: OfferModelService, private _constants: Constants) { 

	}

	searchOffers(qStr, distance, userId) {
		let self = this;
		return new Promise((resolve, reject) => {
			let user = self._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/offers?q=" + qStr + "&d=" + distance + "&uid=" + userId;
			self._apiService.get(url)
			.subscribe((searchObj) => {
				let rtn = JSON.parse(searchObj["_body"]);

				rtn = rtn.filter((obj) => { return obj["userId"] !== user["id"]; });

				rtn.forEach((offer) => {
					self._offerModelService.setOfferImageOrientation(offer);
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

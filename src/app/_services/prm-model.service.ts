import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { PictureService } from './picture.service';
import { PictureEXIFService } from './picture-exif.service';

import { Constants } from '../../_constants/constants';
import { environment } from '../../_environments/environment';

@Injectable()
export class PrmModelService {
	
	constructor(private _apiService: ApiService, private _userService: UserService,
				private _pictureService: PictureService,
				private _pictureEXIFService: PictureEXIFService,
				private _constants: Constants,
				private _events: Events
	) {

	}

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
			}, (err) => {
				reject(err);
			});
		});
	}

	setPrmMetadata(prm) {

		// TODO:
		// There's a piece of the framework here.. An object which takes tuples of apiURLs,domainObjects, and DO-property-names
		// Perhaps it takes the domain object, then apiURL and DO property name pairs. Then returns a promise which will have
		// set the properties to the results of all the API calls when it resolves. So I don't have to check each property in each
		//  method here. I've done this pattern (checking each) in other places too.

		return new Promise((resolve, reject) => {
			let count = 0;
			let func = (prm) => {
				let numPiecesOfMetadata = 4;

				if (++count > numPiecesOfMetadata)
					resolve(prm);
			}

			let url = environment.apiUrl + "/api/promises/" + prm["id"] + "/fulfillment-dates"; 
			this._apiService.get(url)
			.subscribe((data) => {
				prm["fulfillment_dates"] = JSON.parse(data["_body"]);
				func(prm);
			}, (err) => {
				reject(err);
			});

			url = environment.apiUrl + "/api/promises/" + prm["id"] + "/complaint-count"; 
			this._apiService.get(url)
			.subscribe((data) => {
				prm["num_of_complaints"] = JSON.parse(data["_body"]);
				func(prm);
			}, (err) => {
				reject(err);
			});

			url = environment.apiUrl + "/api/promises/" + prm["id"] + "/total-points-earned"; 
			this._apiService.get(url)
			.subscribe((data) => {
				prm["total_points_earned"] = JSON.parse(data["_body"]);
				func(prm);
			}, (err) => {
				reject(err);
			});

			this.setPrmImageOrientation(prm).then((prm) => {
				func(prm);
			})
		});
	}

	setPrmImageOrientation(prm) {
		let self = this;

		return new Promise((resolve, reject) => {

			// TODO: This code is mainly duplicated in prm-collection.service

			self._pictureService.get(self._constants.PHOTO_TYPE_PRM, prm["id"]).then((filename) => {
				prm["imageFileSource"] = 'eog';
				prm["imageFileURI"] = filename;
				prm["imageFileURI_OriginalValue"] = filename;

				if (filename) {
					self._pictureEXIFService.getEXIFMetadata(filename).then((exifMetadata) => {
						prm["imageOrientation"] = exifMetadata["Orientation"];
						resolve(prm);
					})
				} else {
					resolve(prm);
				}
			});

		})
	}

	save(model, cb) {
		let self = this;
		let data = this.JSON_to_URLEncoded(model, undefined, undefined);

		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/promises";
			this._apiService.post(url, data)
			.subscribe((resp) => {
				let obj = JSON.parse(resp["_body"]);

				let func = () => {
					self._events.publish("promise:saved", obj)
					resolve(obj);
				}

				if (cb) {
					cb(obj).then(() => {
						func();
					}).catch((err) => {
						console.log("error in prmModelService calling the callback");
						console.log(JSON.stringify(err));
					})
				} else {
					func();
				}
			},
			(err) => {
				console.log("Error calling API POST for " + url)
				console.log(JSON.stringify(err))
				reject(err);
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
		let self = this;
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/promises/" + model["id"];
			this._apiService.delete(url)
			.subscribe((resp) => {
				let obj = JSON.parse(resp["_body"]);
				
				self._events.publish("promise:deleted", obj)
				
				resolve(obj);
			}, (err) => {
				reject(err);
			});
		});	
	}
}

import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { Constants } from '../../../_constants/constants';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';
import { PointsService } from '../../../app/_services/points.service';
import { PictureService } from '../../../app/_services/picture.service';
import { RecommendationService } from '../../../app/_services/recommendation.service';
import { UserPreferencesService } from '../../../app/_services/user-preferences.service';
import { ContactInfoVisibilityService } from '../../../pages/profile/_services/contact-info-visibility.service';


import { environment } from '../../../_environments/environment';

@Injectable()
export class ProfileService {

	modelCache = {};

	constructor(private _apiService: ApiService, 
				private _userService: UserService, 
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService,
				private _pictureService: PictureService,
				private _userPreferencesService: UserPreferencesService,
				private _contactInfoVisibilityService: ContactInfoVisibilityService,
				private _constants : Constants,
				private _events: Events) {

				}

	init(userId) {
		this._recommendationService.init();
		this._pointsService.init();
		this._pictureService.reset(this._constants.PHOTO_TYPE_PROFILE, userId);

		this.modelCache[userId] = undefined;
	}

	getModel(userId) {
		if (this.modelCache[userId] === undefined) {
			this.modelCache[userId] = {};
			return this.initModel(userId, this.modelCache[userId]);
		} else { 
			return this.modelCache[userId];
		}
	}

	initModel(userId, model) {

		this._pointsService.init();
		this._recommendationService.init();
		this._pictureService.init()

		model["points"] = {"total" : 0, "available": 0};

		this._userService.getUser(userId, true /* force an API call */).then((userObj) => {
			model["realname"] = userObj["realname"];
			model["phone"] = userObj["phone"];
			model["email"] = userObj["email"];
		});

		let url = environment.apiUrl + "/api/user/" + userId + "/profile";
		this._apiService.get(url).subscribe((data) => {
			let obj = JSON.parse(data["_body"]);
			
			model["allTimePointCount"] = obj["allTimePointCount"];
			model["description"] = obj["description"];

			model["keywords"] = obj["keywords"];
			model["keywords"].sort((a, b) => { let aText = a.text.toLowerCase(); let bText = b.text.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })

			/* 
				TODO: Find a better way to do this. Something better than a hardcoded list of social media platforms.

			model["facebookUrl"] = obj["facebookUrl"] || undefined;
			model["youtubeUrl"] = obj["youtubeUrl"] || undefined;
			model["instagramUrl"] = obj["instagramUrl"] || undefined;
			model["githubUrl"] = obj["githubUrl"] || undefined;
			model["linkedinUrl"] = obj["linkedinUrl"] || undefined;
			*/

			model["requestCount"] = obj["requestCount"];
			model["disputedRequestCount"] = obj["disputedRequestCount"];
			model["mostRecentDisputedRequestTimestamp"] = obj["mostRecentDisputedRequestTimestamp"] || undefined;
		});

		if (model["imageFileURI"] === undefined) {
			this._pictureService.get(this._constants.PHOTO_TYPE_PROFILE, userId).then((filename) => {
				model["imageFileSource"] = 'eog';
				model["imageFileURI"] = filename;
				model["imageFileURI_OriginalValue"] = filename;
			})
  		} 

  		// TODO --- REMOVE THIS. Its In Prm-Service now ---
		url = environment.apiUrl + "/api/user/" + userId + "/promises";
		this._apiService.get(url).subscribe((prmsObj) => {
			model["prms"] = JSON.parse(prmsObj["_body"]);
			model["prms"].sort((a, b) => { let aText = a.title.toLowerCase(); let bText = b.title.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })
		});
		// END TODO

		this._pointsService.getCurrentAvailableUserPoints().then((pts) => {
			model["points"]["available"] = pts;
		});

		this._pointsService.getCurrentUserPointsAsSum().then((pts) => {
			model["points"]["total"] = pts;
		});

		let currentUser = this._userService.getCurrentUser();
		if (currentUser["id"] === userId) {
			model["currentUserCanSeeEmailInfo"] = true;
			model["currentUserCanSeePhoneInfo"] = true;
		}
		else {
			let self = this;
			url = environment.apiUrl + "/api/user/" + userId + "/requests/inprogress/user/" + currentUser["id"];
			self._apiService.get(url).subscribe((prmsObj) => {
				var b = JSON.parse(prmsObj["_body"]).length > 0;
				
				if (b) {
					self._contactInfoVisibilityService.getContactInfoVisibilityId(userId).then((visId) => {
						model["currentUserCanSeeEmailInfo"] = self._contactInfoVisibilityService.isEmailAllowed(visId);
						model["currentUserCanSeePhoneInfo"] = self._contactInfoVisibilityService.isPhoneAllowed(visId);
					})
				}
			});
		}
		
		this._recommendationService.getOutgoingRecommendations().then((obj) => {
			model["outgoingRecommendations"] = obj;
		});

		return model;
	}

	save(model) {
		let tmp = {};

		let user = this._userService.getCurrentUser();

		tmp["profileId"] = model["id"];
		tmp["userId"] = user["id"];
		tmp["realname"] = model["realname"];
		tmp["phone"] = model["phone"];
		tmp["email"] = model["email"];
		tmp["keywords"] = model["keywords"];
		tmp["description"] = model["description"];

/*
		tmp["facebookUrl"] = model["facebookUrl"];
		tmp["youtubeUrl"] = model["youtubeUrl"];
		tmp["instagramUrl"] = model["instagramUrl"];
		tmp["githubUrl"] = model["githubUrl"];
		tmp["linkedinUrl"] = model["linkedinUrl"];
*/

		let data = this.JSON_to_UrlEncoded(tmp, undefined, undefined);
		console.log(data);

		let self = this;
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/profiles";
			self._apiService.post(url, data)
			.subscribe((resp) => {
				console.log(JSON.parse(resp["_body"]));

				let userUpdateFunc = () => {
					this._events.publish('profile:changedContactInfoWasSaved', model);

					self.init(user["id"]);
					resolve(JSON.parse(resp["_body"]));					
				}

				if (self.isProfileImageChanged(model)) {
					self._pictureService.save(this._constants.PHOTO_TYPE_PROFILE, user["id"], model["imageFileURI"]).then((data) => {
						self.init(user["id"]);
						userUpdateFunc();
					});

					// TODO: Add a catch here, what if the saving of the picture fails? Need to throw that up
					//  the chain so that whatever is calling this can update the UI, let the user know whatever.
					//  As a reminder, the impetus for this, I was uploading a file that turned out to be too big
					//  and caused a 500 error on the server. ProfilePictureService caught the error, logged it,
					//  and called the reject() method on the promise, but this code doesn't recognize the reject()ion
					//  and leaves the "Uploading..." spinner in place, waiting for a response that's never coming.

				} else
					userUpdateFunc();
			});
		});
	}

	isProfileImageChanged(model) {
		return model["imageFileURI_OriginalValue"] != model["imageFileURI"];
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
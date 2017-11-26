import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';
import { PointsService } from '../../../app/_services/points.service';
import { ProfilePictureService } from '../../../app/_services/profile-picture.service';
import { RecommendationService } from '../../../app/_services/recommendation.service';
import { NotificationService } from '../../../pages/profile/_services/notification.service'

import { environment } from '../../../_environments/environment';

@Injectable()
export class ProfileService {

	modelCache = {};
	mostProbableProfilePhotoPath = "file:///data/data/io.easyah.mobileapp/cache/eogAppProfilePic";

	constructor(private _apiService: ApiService, 
				private _userService: UserService, 
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService,
				private _notificationService: NotificationService,
				private _profilePictureService: ProfilePictureService,
				private _events: Events) {

				}

	init(user) {
		this._recommendationService.init();
		this._pointsService.init();
		this._notificationService.init();
		this._profilePictureService.reset(user["id"]);

		this.modelCache[user["id"]] = undefined;
	}

	getModel(user) {
		if (this.modelCache[user["id"]] === undefined) {
			this.modelCache[user["id"]] = {};
			return this.initModel(user, this.modelCache[user["id"]]);
		} else { 
			return this.modelCache[user["id"]];
		}
	}

	initModel(user, model) {

		let self = this;

		this._pointsService.init();
		this._recommendationService.init();
		this._profilePictureService.init()

		model["realname"] = user["realname"];
		model["phone"] = user["phone"];
		model["email"] = user["email"];
		model["points"] = {"total" : 0, "available": 0};

		let url = environment.apiUrl + "/api/user/" + user["id"] + "/profile";
		this._apiService.get(url).subscribe((data) => {
			let obj = JSON.parse(data["_body"]);
			
			if (obj[0] === undefined)
				model["allTimePointCount"] = 0;
			else 
				model["allTimePointCount"] = obj[0]["allTimePointCount"];
		});

		if (model["imageFileURI"] === undefined) {
			this._profilePictureService.get(user["id"], this.getMostProbableProfilePhotoPath() + user["id"]).then((filename) => {
				model["imageFileSource"] = 'eog';
				model["imageFileURI"] = filename;
				model["imageFileURI_OriginalValue"] = filename;
			})
  		}

		url = environment.apiUrl + "/api/user/" + user["id"] + "/keywords";
		this._apiService.get(url).subscribe((keywordsObj) => {
			model["keywords"] = JSON.parse(keywordsObj["_body"]);
			model["keywords"].sort((a, b) => { let aText = a.text.toLowerCase(); let bText = b.text.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })
		});

		url = environment.apiUrl + "/api/user/" + user["id"] + "/promises";
		this._apiService.get(url).subscribe((prmsObj) => {
			model["prms"] = JSON.parse(prmsObj["_body"]);
			model["prms"].sort((a, b) => { let aText = a.title.toLowerCase(); let bText = b.title.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })
		});

		this._pointsService.getCurrentAvailableUserPoints().then((pts) => {
			model["points"]["available"] = pts;
		});

		this._pointsService.getCurrentUserPointsAsSum().then((pts) => {
			model["points"]["total"] = pts;
		});

		let currentUser = this._userService.getCurrentUser();
		if (currentUser["id"] === user["id"])
			model["currentUserCanSeeContactInfo"] = true;
		else {
			url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/inprogress/user/" + currentUser["id"];
			this._apiService.get(url).subscribe((prmsObj) => {
				model["currentUserCanSeeContactInfo"] = JSON.parse(prmsObj["_body"]).length > 0;
			});
		}
		
		this._recommendationService.getIncomingRecommendations(user).then((obj: Array<Object>) => {
			model["incomingRecommendations"] = obj;
			model["availableIncomingRecommendations"] = obj.filter((obj) => { return obj["escrowedRequestId"] === null });
			model["availableIncomingRecommendations"].map((rec) => { 
				self._userService.getUser(rec["providingUserId"]).then((user) => {
					rec["userInfo"] = user;
				});
			});
		});

		//if (!readOnly) {
			this._recommendationService.getOutgoingRecommendations().then((obj) => {
				model["outgoingRecommendations"] = obj;
			});

			this._notificationService.get().then((obj) => {
				model["notifications"] = obj;
			});
		//}

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

		//let profileImageData = this.JSON_to_URLEncoded({base64ImageData: model["base64Image"]}, undefined, undefined);

		let data = this.JSON_to_URLEncoded(tmp, undefined, undefined);
		console.log(data);

		let self = this;
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/profiles";
			self._apiService.post(url, data)
			.subscribe((resp) => {
				console.log(JSON.parse(resp["_body"]));

				let userUpdateFunc = () => {
					// force refresh of current user in the userService
					// TODO: Make the userService do this itself, perhaps with events.
					self._userService.getUser(user["id"], true).then((userObj) => {
						userObj["password"] = user["password"];
						self._userService.setCurrentUser(userObj);

						this._events.publish('profile:changedContactInfoWasSaved', model);

						resolve(JSON.parse(resp["_body"]));					
					});
				}

				if (self.isProfileImageChanged(model)) {
					self._profilePictureService.save(user["id"], model["imageFileURI"]).then((data) => {
						userUpdateFunc();
					});
				} else
					userUpdateFunc();
			});
		});
	}

	isProfileImageChanged(model) {
		return model["imageFileURI_OriginalValue"] != model["imageFileURI"];
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

	setMostProbableProfilePhotoPath(str) {
		this.mostProbableProfilePhotoPath = str;
	}

	getMostProbableProfilePhotoPath() {
		return this.mostProbableProfilePhotoPath;
	}

}
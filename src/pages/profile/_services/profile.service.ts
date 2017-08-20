import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';
import { PointsService } from '../../../app/_services/points.service';
import { RecommendationService } from '../../../app/_services/recommendation.service';

import { environment } from '../../../_environments/environment';

@Injectable()
export class ProfileService {
	
	constructor(private _apiService: ApiService, 
				private _userService: UserService, 
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService) { 
					this._recommendationService.init();
				}

	getModel() {
		let user = this._userService.getCurrentUser();
		let model = {};

		model["realname"] = user["realname"];
		model["phone"] = user["phone"];
		model["email"] = user["email"];
		model["points"] = {"total" : 0, "available": 0};

		let url = environment.apiUrl + "/api/user/" + user["id"] + "/keywords";
		this._apiService.get(url).subscribe((keywordsObj) => {
			model["keywords"] = JSON.parse(keywordsObj["_body"]);
		});

		url = environment.apiUrl + "/api/user/" + user["id"] + "/dreams";
		this._apiService.get(url).subscribe((dreamsObj) => {
			model["dreams"] = JSON.parse(dreamsObj["_body"]);
		});

		url = environment.apiUrl + "/api/user/" + user["id"] + "/things";
		this._apiService.get(url).subscribe((thingsObj) => {
			model["things"] = JSON.parse(thingsObj["_body"]);
		});

		this._pointsService.getCurrentAvailableUserPoints().then((pts) => {
			model["points"]["available"] = pts;
		});

		this._pointsService.getCurrentUserPointsAsSum().then((pts) => {
			model["points"]["total"] = pts;
		});

		this._recommendationService.getIncomingRecommendations().then((obj) => {
			model["incomingRecommendations"] = obj;
		});

		this._recommendationService.getOutgoingRecommendations().then((obj) => {
			model["outgoingRecommendations"] = obj;
		});

		return model;
	}
}
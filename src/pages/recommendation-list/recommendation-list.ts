import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { RecommendationService } from '../../app/_services/recommendation.service'
import { ProfileService } from '../../pages/common/_services/profile.service'
import { ProfilePictureService } from '../../app/_services/profile-picture.service'

import { ProfilePage } from '../profile/profile'

@Component({
  selector: 'recommendation-list',
  templateUrl: 'recommendation-list.html'
})

export class RecommendationListPage {

	model = undefined;
	dirty = undefined;

	directionallyOppositeUserProfileImageFilepath = {};	

	constructor(private _profileService : ProfileService,
				private _recommendationService : RecommendationService,
				private _profilePictureService: ProfilePictureService,
				private navCtrl: NavController,
				private _events: Events
	) {
		this.setDirty(true);

		this._events.subscribe('recommendation:received', () => { this.setDirty(true); this.ngOnInit(); }));
		this._events.subscribe('request:markedApprovedAfterCompletion', () => { this.setDirty(true); this.ngOnInit(); }));
	}

	ngOnInit() {
		if (this.isDirty()) {
			this._recommendationService.getIncomingRecommendations().then((data) => {
				this.model = data;
			});
		}
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b || true;
	}

	areIncomingRecommendationsAvailable() {
		return this.model != undefined && this.model != null; // this.model["availableIncomingRecommendations"] !== undefined && this.model["availableIncomingRecommendations"].length > 0;
	}

	getAvailableIncomingRecommendations() {
		return this.model; // this.model["availableIncomingRecommendations"];
	}

	getDOUserProfileImageFilepath(userId) {
		return this.directionallyOppositeUserProfileImageFilepath[userId];
	}

	// TODO: This method appears in several classes. Refactor this to a single source.
	isDOUserProfileImageAvailable(userId) {
		let rtn = this.directionallyOppositeUserProfileImageFilepath[userId] !== undefined && this.directionallyOppositeUserProfileImageFilepath[userId] !== null;

		let self = this;
		if (self.directionallyOppositeUserProfileImageFilepath[userId] === undefined && userId !== undefined) {
			self.directionallyOppositeUserProfileImageFilepath[userId] = null;

			let path = self._profileService.getMostProbableProfilePhotoPath(userId);
			
			self._profilePictureService.get(userId, path).then((path) => {
				if (path !== undefined)
					self.directionallyOppositeUserProfileImageFilepath[userId] = path;
			});
		}

		return rtn; 
	}

	getRealName(item) {
		let rtn = undefined;
		
		if (item["userInfo"]) {
			rtn = item["userInfo"]["realname"];
		}

		return rtn
	}

	onViewUser(item) {
		this.navCtrl.push(ProfilePage, {user: item["userInfo"]});
	}
}
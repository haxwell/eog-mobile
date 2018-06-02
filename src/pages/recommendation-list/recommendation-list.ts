import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { UserService } from '../../app/_services/user.service';
import { RecommendationService } from '../../app/_services/recommendation.service'
import { ProfileService } from '../../pages/common/_services/profile.service'
import { ProfilePictureService } from '../../app/_services/profile-picture.service'

import { ProfilePage } from '../profile/profile'

import EXIF from 'exif-js';

@Component({
  selector: 'recommendation-list',
  templateUrl: 'recommendation-list.html'
})

export class RecommendationListPage {

	dirty = undefined;

	directionallyOppositeUserProfileImageFilepath = {};	

	incomingRecommendations = undefined;
	availableIncomingRecommendations = undefined;
	imageOrientation = undefined;

	constructor(private _userService : UserService,
				private _profileService : ProfileService,
				private _recommendationService : RecommendationService,
				private _profilePictureService: ProfilePictureService,
				private navCtrl: NavController,
				private _events: Events
	) {
		this.setDirty(true);

		this._events.subscribe('recommendation:received', () => { console.log("RECOMMENDATION-LIST: received recommendation"); this.setDirty(true); this.ngOnInit(); });
		this._events.subscribe('request:markedApprovedAfterCompletion', () => { console.log("RECOMMENDATION-LIST: got markedApprovedAfterCompletion event"); this.setDirty(true); this.ngOnInit(); });
	}

	ngOnInit() {
		if (this.isDirty()) {
			let self = this;

			self._recommendationService.init();
			self._recommendationService.getIncomingRecommendations().then((data: Array<any>) => {
				self.incomingRecommendations = data;

				self.availableIncomingRecommendations = data.filter((rec) => { return rec["escrowedRequestId"] === null });
				self.availableIncomingRecommendations.map((rec) => { 
					self._userService.getUser(rec["providingUserId"]).then((user) => {
						rec["userInfo"] = user;
					});
				});
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
		return this.availableIncomingRecommendations !== undefined && this.availableIncomingRecommendations.length > 0;
	}

	getAvailableIncomingRecommendations() {
		return this.availableIncomingRecommendations;
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

	getAvatarCSSClassString() {
		if (this.imageOrientation === 8)
			return "rotate90Counterclockwise";
		else if (this.imageOrientation === 3)
			return "rotate180 centered";
		else if (this.imageOrientation === 6)
			return "rotate90Clockwise";
	}

	loaded(evt) {
		let self = this;
		EXIF.getData(evt.target, function() {
			self.imageOrientation = EXIF.getTag(this, "Orientation");
		});
	}
}
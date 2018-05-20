import { Component } from '@angular/core';

import { NotificationService } from '../../app/_services/notification.service'
import { ProfileService } from '../../pages/common/_services/profile.service'
import { ProfilePictureService } from '../../app/_services/profile-picture.service'

import EXIF from 'exif-js';

@Component({
  selector: 'notification-list',
  templateUrl: 'notification-list.html'
})

export class NotificationListPage {

	model = undefined;
	dirty = true;
	newKeywordsString = '';

	imageOrientation = undefined;

	directionallyOppositeUserProfileImageFilepath = {};

	constructor(private _notificationService : NotificationService,
				private _profilePictureService : ProfilePictureService,
				private _profileService : ProfileService
	) {

	}

	ngOnInit() {
		var self = this;
		if (self.isDirty()) {
			self._notificationService.get().then((data) => {
				self.model = data;
			});
		}
	}

/*
	ionViewWillLeave() {
		if (this.isDirty()) {
			this._keywordService.save(this.model);
		}
	}
*/

	getTrack(item) {
		return "notification";
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b || true;
	}

	userHasNoNotifications() { 
		return this.model === undefined || this.model.length ==0;
	}

	getNotifications() {
		if (!this.model)
			return [];
		else
			return this.model.sort((a, b) => {
				if (a.timestamp > b.timestamp) return -1; 
				else if (a.timestamp < b.timestamp) return 1; 
				else return 0; 
			});
	}


	onClearIndividualNotification(item) {
		this._notificationService.delete(item).then(() => {
			this.model = this.model.filter((obj) => {
				return obj["id"] !== item["id"];
			});
		});
	}

	onNotificationClearAllBtnPress() {
		this._notificationService.deleteAll().then(() => {
			this.model = undefined;
		});
	}

	getDOUserProfileImageFilepath(userId) {
		return this.directionallyOppositeUserProfileImageFilepath[userId];
	}

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
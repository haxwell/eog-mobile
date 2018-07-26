import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

import { Constants } from '../../_constants/constants'

import { NotificationService } from '../../app/_services/notification.service'
import { PictureService } from '../../app/_services/picture.service'

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
				private _pictureService : PictureService,
				private _constants: Constants,
				private _events: Events				
	) {
		
		let func = () => {
			this.setDirty(true);
			this.ngOnInit();
		}

		this._events.subscribe("request:received", func)
		this._events.subscribe("request:accepted", func)
		this._events.subscribe("request:declined", func)
		this._events.subscribe("request:completed", func)
		this._events.subscribe("request:outgoing:cancelled", func)
		this._events.subscribe("request:completedAndApproved", func)
		this._events.subscribe("request:isInDispute", func)
		this._events.subscribe("request:inamicablyResolved", func)
		this._events.subscribe("recommendation:received", func)
		this._events.subscribe("points:received", func)
	}

	ngOnInit() {
		var self = this;
		if (self.isDirty()) {
			self._notificationService.get(true /* force update */ ).then((data) => {
				self.model = data;
			});
		}
	}

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

			self._pictureService.get(this._constants.PHOTO_TYPE_PROFILE, userId).then((path) => {
				if (path !== undefined)
					self.directionallyOppositeUserProfileImageFilepath[userId] = path;
			});
		}

		return rtn; 
	}

	getAvatarCSSClassString() {
		// this did not have "centered" as a default css class.. everything still look okay?
		return this._pictureService.getOrientationCSS(this);
	}

	loaded(evt) {
		let self = this;
		EXIF.getData(evt.target, function() {
			self.imageOrientation = EXIF.getTag(this, "Orientation");
		});
	}
}
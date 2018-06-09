import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

import { ProfileService } from '../_services/profile.service'

import EXIF from 'exif-js'

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.html'
})

export class ProfileHeader {

	userId = undefined;
	imageOrientation = undefined;

	constructor(private _profileService: ProfileService, 
				private _events: Events) {

		let self = this;
		self._events.subscribe('app:login', (currentUser) => { this.userId = currentUser["id"]; });
	}

	ngOnInit() {

	}

	isThumbnailImageAvailable() {
		if (this.userId)
			return this._profileService.getModel(this.userId)["imageFileURI"] !== undefined;
		else
			return false;
	}

	getThumbnailImage() {
		if (this.userId && this._profileService.getModel(this.userId)["imageFileURI"] !== undefined)
			return this._profileService.getModel(this.userId)["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	getModelAttr(key) {
		if (this.userId) {
			let model = this._profileService.getModel(this.userId) || {};
			return model[key];
		} else {
			return undefined;
		}
	}

	getAvatarCSSClassString() {
		if (this.imageOrientation === 8)
			return "rotate90Counterclockwise centered";
		else if (this.imageOrientation === 3)
			return "rotate180 centered";
		else if (this.imageOrientation === 6)
			return "rotate90Clockwise centered";
		else
			return "centered";
	}

	loaded(evt) {
		let self = this;
		EXIF.getData(evt.target, function() {
			self.imageOrientation = EXIF.getTag(this, "Orientation");
		});
	}
}

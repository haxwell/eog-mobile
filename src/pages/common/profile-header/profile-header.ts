import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

import { ProfileService } from '../_services/profile.service'
import { PictureService } from '../../../app/_services/picture.service'
import { UserService } from '../../../app/_services/user.service'

import EXIF from 'exif-js'

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.html'
})

export class ProfileHeader {

	userId = undefined;
	imageOrientation = undefined;

	constructor(private _profileService: ProfileService, 
				private _pictureService: PictureService,
				private _userService: UserService) {

	}

	ngOnInit() {
		this.userId = this._userService.getCurrentUser()["id"];
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
		return this._pictureService.getOrientationCSS(this);
	}

	loaded(evt) {
		let self = this;
		EXIF.getData(evt.target, function() {
			self.imageOrientation = EXIF.getTag(this, "Orientation");
		});
	}
}

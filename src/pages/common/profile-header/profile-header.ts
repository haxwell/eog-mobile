import { Component, Input } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { File } from '@ionic-native/file'

import { ProfileService } from '../_services/profile.service'

import EXIF from 'exif-js'

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.html'
})

export class ProfileHeader {

	dirty = false;
	@Input() user = undefined;

	imageOrientation = undefined;

	constructor(private _profileService: ProfileService, 
				private _events: Events) {

		let self = this;
		let func2 = (data) => {
			let model = this._profileService.getModel(this.user["id"]);

			model["realname"] = data["realname"];
			model["phone"] = data["phone"];
			model["email"] = data["email"];

			self.setDirty(true);
		};
		self._events.subscribe('profile:changedContactInfoWasSaved', func2);
	}

	ngOnInit() {

	}

	ionViewWillEnter() {
		if (this.isDirty()) 
			this.ngOnInit();
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	isFromGallery() {
		return this._profileService.getModel(this.user["id"])["imageFileSource"] == 'gallery';
	}

	isThumbnailImageAvailable() {
		return this._profileService.getModel(this.user["id"])["imageFileURI"] !== undefined;
	}

	getThumbnailImage() {
		if (this._profileService.getModel(this.user["id"])["imageFileURI"] === undefined)
			return "assets/img/mushroom.jpg";
		else
			return this._profileService.getModel(this.user["id"])["imageFileURI"];
	}

	getModelAttr(key) {
		let model = this._profileService.getModel(this.user["id"]) || {};
		return model[key];
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

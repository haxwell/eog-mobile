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

		// TODO: This is ugly. We do this because this is part of the app.html file, because
		//  that is where the menu is defined, and that is called first before anything else.
		//  so, there's no user at that time. This component is also used when viewing another
		//  user's profile. So it needs a user objet. So we get one for the current user so this
		//  can display in the menu properly when the menu comes up, and we set it in the html
		//  (by passing a function which calls for the user to be displayed) elsewhere.

		// Ideally, this wouldn't even be called until a user was ready. And then we could
		//  ONLY set it through the HTML, not need this event sub. Regardless, yuk poo.
		self._events.subscribe('app:login', (currentUser) => { this.user = currentUser; });
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
		if (this.user)
			return this._profileService.getModel(this.user["id"])["imageFileSource"] == 'gallery';
		else
			return false;
	}

	isThumbnailImageAvailable() {
		if (this.user)
			return this._profileService.getModel(this.user["id"])["imageFileURI"] !== undefined;
		else
			return false;
	}

	getThumbnailImage() {
		if (this.user && this._profileService.getModel(this.user["id"])["imageFileURI"] !== undefined)
			return this._profileService.getModel(this.user["id"])["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	getModelAttr(key) {
		if (this.user) {
			let model = this._profileService.getModel(this.user["id"]) || {};
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

import { Component, Input } from '@angular/core';
import { ModalController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ChoosePhotoSourcePage } from '../choose-photo-source/choose-photo-source'

import { UserService } from '../../../app/_services/user.service'
import { ProfileService } from '../_services/profile.service'

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.html'
})

export class ProfileHeader {

	@Input() readOnly = false;
	dirty = false;
	@Input() user = undefined;
	model = {};

	constructor(navParams: NavParams, private modalCtrl: ModalController, private _profileService: ProfileService, private _userService: UserService, private _events: Events) {
		this.user = Object.assign({}, navParams.get('user'));
		this.readOnly = navParams.get('readOnly') || false;

		let self = this;
		let func2 = (data) => {
			self.model["realname"] = data["realname"];
			self.model["phone"] = data["phone"];
			self.model["email"] = data["email"];

			self.setDirty(true);
		};
		self._events.subscribe('profile:changedContactInfoWasSaved', func2);
	}

	ngOnInit() {
		this.model = this._profileService.getModel(this.user);
	}

	isCurrentUserAllowedToSeeContactInfo() {
		return this.model["currentUserCanSeeContactInfo"];
	}

	isReadOnly() {
		return this.readOnly;
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	isThumbnailImageAvailable() {
		return this.model["base64Image"] !== undefined;
	}

	getBase64ThumbnailImage() {
		if (this.model["base64Image"] === undefined)
			return "assets/img/mushroom.jpg";
		else if (this.model["base64Image"].length < 6)
			return "assets/img/mushroom.jpg";
		else
			return 'data:image/jpeg;base64,' + this.model["base64Image"];
	}

	onThumbnailPress($event) {
		if (!this.isReadOnly()) {
			let self = this;
			let modal = this.modalCtrl.create(ChoosePhotoSourcePage);
			
			modal.onDidDismiss((promise) => {
				if (promise) {
					promise.then((imageAsString) => { 
						self.setDirty(true);
						self.model["base64Image"] = imageAsString;
					})
				}
			});
			
			modal.present();
		}
	}

	onNameChange(event) {
		this.model["realname"] = event._value;
		this._events.publish('profile:changedContactInfo', this.model);
		this.setDirty(true);
	}

	onEmailChange(event) {
		this.model["email"] = event._value;
		this._events.publish('profile:changedContactInfo', this.model);
		this.setDirty(true);
	}

	onPhoneChange(event) {
		this.model["phone"] = event._value;
		this._events.publish('profile:changedContactInfo', this.model);
		this.setDirty(true);
	}
}

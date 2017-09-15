import { Component, Input } from '@angular/core';
import { ModalController, NavParams } from 'ionic-angular';

import { ChoosePhotoSourcePage } from '../choose-photo-source/choose-photo-source'

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

	constructor(navParams: NavParams, private modalCtrl: ModalController, private _profileService: ProfileService) {
		this.user = Object.assign({}, navParams.get('user'));
		this.readOnly = navParams.get('readOnly') || false;
	}

	ngOnInit() {
		this.model = this._profileService.getModel(this.user);
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

	onNameChange() {
		this.setDirty(true);
	}

	onEmailChange() {
		this.setDirty(true);
	}

	onPhoneChange() {
		this.setDirty(true);
	}
}

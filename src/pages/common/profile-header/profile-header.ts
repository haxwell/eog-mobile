import { Component, Input } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { File } from '@ionic-native/file'

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
	modalCtrl = undefined;

	constructor(/*navParams: NavParams, */
				modalCtrll: ModalController, 
				private _profileService: ProfileService, 
				private _events: Events,
				private _file: File) {

		this.modalCtrl = modalCtrll;

		//this.user = Object.assign({}, navParams.get('user'));
		//this.readOnly = navParams.get('readOnly') || false;

		let self = this;
		let func2 = (data) => {
			let model = this._profileService.getModel(this.user);

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

	isCurrentUserAllowedToSeeContactInfo() {
		return this._profileService.getModel(this.user)["currentUserCanSeeContactInfo"];
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

	isFromGallery() {
		return this._profileService.getModel(this.user)["imageFileSource"] == 'gallery';
	}

	isThumbnailImageAvailable() {
		return this._profileService.getModel(this.user)["imageFileURI"] !== undefined;
	}

	getThumbnailImage() {
		if (this._profileService.getModel(this.user)["imageFileURI"] === undefined)
			return "assets/img/mushroom.jpg";
		else

			// WILO: Is this being called when we go from Profile to Home? If so, is this a different model?
			//  why is the picture not changing?

			return this._profileService.getModel(this.user)["imageFileURI"];
	}

	onThumbnailPress($event) {
		if (!this.isReadOnly()) {
			let self = this;
			let model = this._profileService.getModel(this.user);
			let modal = this.modalCtrl.create(ChoosePhotoSourcePage, {userId: this.user["id"], fileURI: model["imageFileURI"], fileSource: model["imageFileSource"]});
			
			modal.onDidDismiss((promise) => {
				if (promise) {
					promise.then((uriAndSource) => { 
						if (uriAndSource === undefined) {
							uriAndSource = {};
						}

						let model = this._profileService.getModel(this.user);

						if (model["imageFileURI"] !== undefined && model["imageFileSource"] == 'camera') {
							let lastSlash = model["imageFileURI"].lastIndexOf('/');
							let path = model["imageFileURI"].substring(0,lastSlash+1);
							let filename = model["imageFileURI"].substring(lastSlash+1);

							self._file.removeFile(path, filename).then((data) => {
								this._profileService.setMostProbableProfilePhotoPath(uriAndSource["imageFileURI"]);

								console.log("User saved a new profile image. [" + model["imageFileURI"] + "] is no longer the image to use, so it has been removed." );
								console.log("setting profile header model to [" + uriAndSource["imageFileURI"] + "], and throwing profile:changedProfileImage event");

								model["imageFileURI"] = uriAndSource["imageFileURI"];
								model["imageFileSource"] = uriAndSource["imageFileSource"];

								self._events.publish('profile:changedProfileImage', model["imageFileURI"]);
								self.setDirty(true);						
							})
						} else {
							console.log("no previous image to delete, so skipping that step...")
							console.log("setting profile header model to [" + uriAndSource["imageFileURI"] + "], and throwing profile:changedProfileImage event");

							model["imageFileURI"] = uriAndSource["imageFileURI"];
							model["imageFileSource"] = uriAndSource["imageFileSource"];

							self._events.publish('profile:changedProfileImage', model["imageFileURI"]);
							self.setDirty(true);
						}

					});
				}
			});
			
			modal.present();
		}
	}

	setChangedAttr(key, value) {
		let model = this._profileService.getModel(this.user);
		model[key] = value;
		this._events.publish('profile:changedContactInfo', model);
		this.setDirty(true);
	}

	onNameChange(event) {
		this.setChangedAttr("realname", event._value);
	}

	onDescriptionChange(event) {
		this.setChangedAttr("description", event._value);
	}

	onEmailChange(event) {
		this.setChangedAttr("email", event._value);
	}

	onPhoneChange(event) {
		this.setChangedAttr("phone", event._value);
	}

	getModelAttr(key) {
		let model = this._profileService.getModel(this.user) || {};
		return model[key];
	}
}

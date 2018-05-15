import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { ProfileService } from '../../pages/common/_services/profile.service'
import { UserMetadataService } from '../../app/_services/user-metadata.service'

import { ChoosePhotoSourcePage } from '../../pages/common/choose-photo-source/choose-photo-source'

import { File } from '@ionic-native/file'

import EXIF from 'exif-js';

@Component({
  selector: 'page-profile-edit',
  templateUrl: 'profile-edit.html'
})

export class ProfileEditPage {

	model = undefined;
	user = undefined;
	dirty = false;
	loading = undefined;
	isExiting = false;
	cancelBtnPressed = false;

	imageOrientation = undefined;

	constructor(navParams: NavParams,
				public navCtrl: NavController,
				public modalCtrl: ModalController,
				public loadingCtrl: LoadingController,
				public alertCtrl: AlertController,
				private _profileService: ProfileService,
				private _userMetadataService: UserMetadataService,
				private _file: File) {

		this.user = Object.assign({}, navParams.get('user'));
		this.model = navParams.get('model');

		this._userMetadataService.init();
	}

	ngOnInit() {

	}	

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	ionViewCanLeave() {
		let self = this;
		if (this.isDirty() && !self.isExiting) {
			let msg = "";

			if (this._profileService.isProfileImageChanged(this.model) && !this.cancelBtnPressed)
				msg = "You changed your profile picture. Uploading it could take a long while. You got a minute (or ten)?";
			else
				msg = "Do you want to save your profile changes?";

			let alert = this.alertCtrl.create({
				title: 'Save Changes?',
				message: msg,
				buttons: [{
					text: 'No', role: 'cancel', handler: () => {
						if (this._profileService.isProfileImageChanged(this.model) && !this.isFromGallery()) {
							
							// TODO: the call to .removeFile here, and the one in the process of onSaveBtnTap()
							//  are both the same. They should be a service method somewhere.

							let lastSlash = self.model["imageFileURI"].lastIndexOf('/');
							let path = self.model["imageFileURI"].substring(0,lastSlash+1);
							let filename = self.model["imageFileURI"].substring(lastSlash+1);

							self._file.removeFile(path, filename).then((data) => {
								console.log("User set new profile image, but said don't save it when exiting the profile page. Image was from camera or the eog api, so it was removed from phone.");
								
								self.setDirty(false);
								
								self.model["imageFileURI"] = self.model["imageFileURI_OriginalValue"];

								self._profileService.setMostProbableProfilePhotoPath(self.model["imageFileURI"]);
								
								self.navCtrl.pop();
							});

						} else {
							self.setDirty(false);
							self.navCtrl.pop();
						}

					},
				}, {
					text: 'Yes', handler: () => {
						self.setDirty(false);
						self.onSaveBtnTap();

						self.navCtrl.pop();
					},
				}]
			});
			self.isExiting = true;
			alert.present();
		}

		return !this.isDirty();
	}

	getSocialMediaURL(name) {
		return this.model[name+"Url"] || "";
	}

	onCancelBtnTap() {
		this.cancelBtnPressed = true;
		this.navCtrl.pop();
	}

	isSaveBtnEnabled() {
		return this.isDirty();
	}

	onSaveBtnTap() {
		let self = this;
		self.loading = self.loadingCtrl.create({
			content: this._profileService.isProfileImageChanged(this.model) ?
					'Please wait... Uploading as fast as your data connection will allow..' :
					'Please wait...'
		})

		self.loading.present();

		this._profileService.save(this.model).then(() => {
			self.setDirty(false);
			self.loading.dismiss();
			
			if (!self.isExiting)
				self.navCtrl.pop();
		})
	}

	setChangedAttr(key, value) {
		let model = this._profileService.getModel(this.user);
		if (model[key] !== value) {
			model[key] = value;
//			this._events.publish('profile:changedContactInfo', model);
			this.setDirty(true);
		}
	}

	onRealNameChange(event) {
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

	onFacebookChange(event) {
		this.setChangedAttr("facebookUrl", event._value);	
	}

	onLinkedinChange(event) {
		this.setChangedAttr("linkedinUrl", event._value);	
	}

	onYoutubeChange(event) {
		this.setChangedAttr("youtubeUrl", event._value);	
	}

	onInstagramChange(event) {
		this.setChangedAttr("instagramUrl", event._value);	
	}

	onGithubChange(event) {
		this.setChangedAttr("githubUrl", event._value);	
	}

	getModelAttr(key) {
		return this.model[key];
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
			return this._profileService.getModel(this.user)["imageFileURI"];
	}

	onThumbnailPress($event) {
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

							//self._events.publish('profile:changedProfileImage', model["imageFileURI"]);
							self.setDirty(true);						
						})
					} else {
						console.log("no previous image to delete, so skipping that step...")
						console.log("uriAndSource = " + JSON.stringify(uriAndSource))

						this._profileService.setMostProbableProfilePhotoPath(uriAndSource["imageFileURI"]);

						model["imageFileURI"] = uriAndSource["imageFileURI"];
						model["imageFileSource"] = uriAndSource["imageFileSource"];

						//self._events.publish('profile:changedProfileImage', model["imageFileURI"]);
						self.setDirty(true);
					}

				});
			}
		});
		
		modal.present();
	}

	isThumbnailImageVisible() {
		return this.imageOrientation !== undefined;
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

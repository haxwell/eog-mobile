import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { Constants } from '../../_constants/constants'

import { ProfileService } from '../../pages/common/_services/profile.service'
import { PictureService } from '../../app/_services/picture.service'
import { UserMetadataService } from '../../app/_services/user-metadata.service'
import { ContactInfoVisibilityService } from './_services/contact-info-visibility.service'

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

	contactInfoVisibilityId = undefined;
	contactInfoVisibilityChoices = undefined;

	constructor(navParams: NavParams,
				public navCtrl: NavController,
				public modalCtrl: ModalController,
				public loadingCtrl: LoadingController,
				public alertCtrl: AlertController,
				private _profileService: ProfileService,
				private _pictureService: PictureService,
				private _userMetadataService: UserMetadataService,
				private _contactInfoVisibilityService: ContactInfoVisibilityService,
				private _constants: Constants,
				private _file: File) {

		this.user = Object.assign({}, navParams.get('user'));
		
		this.model = this._profileService.getModel(this.user["id"]); 

		this._userMetadataService.init();
	}

	ngOnInit() {
		this.contactInfoVisibilityChoices = this._contactInfoVisibilityService.getContactInfoVisibilityChoices();
		this._contactInfoVisibilityService.getContactInfoVisibilityId(this.user["id"]).then((visId) => {
			this.contactInfoVisibilityId = visId;
		})
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

								self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_PROFILE, self.user["id"], self.model["imageFileURI"]);
								
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

		self._contactInfoVisibilityService.saveContactInfoVisibilityByUserId(self.user["id"], self.contactInfoVisibilityId);

		this._profileService.save(this.model).then(() => {
			self.setDirty(false);
			self.loading.dismiss();
			
			if (!self.isExiting)
				self.navCtrl.pop();
		})
	}

	setChangedAttr(key, value) {
		let model = this._profileService.getModel(this.user["id"]);
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

/*
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
*/

	getModelAttr(key) {
		return this.model[key];
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

	onThumbnailClick($event) {
		let self = this;
		let model = this._profileService.getModel(this.user["id"]);
		let modal = this.modalCtrl.create(ChoosePhotoSourcePage, {fileURI: model["imageFileURI"], fileSource: model["imageFileSource"]});
		
		modal.onDidDismiss((promise) => {
			if (promise) {
				promise.then((uriAndSource) => { 
					if (uriAndSource === undefined) {
						uriAndSource = {};
					}

					let model = this._profileService.getModel(this.user["id"]);

					if (model["imageFileURI"] !== undefined && model["imageFileSource"] == 'camera') {
						let lastSlash = model["imageFileURI"].lastIndexOf('/');
						let path = model["imageFileURI"].substring(0,lastSlash+1);
						let filename = model["imageFileURI"].substring(lastSlash+1);

						self._file.removeFile(path, filename).then((data) => {
							self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_PROFILE, self.user["id"], uriAndSource["imageFileURI"]);

							console.log("User saved a new profile image. [" + model["imageFileURI"] + "] is no longer the image to use, so it has been removed." );
							console.log("setting profile header model to [" + uriAndSource["imageFileURI"] + "]");

							model["imageFileURI"] = uriAndSource["imageFileURI"];
							model["imageFileSource"] = uriAndSource["imageFileSource"];

							//self._events.publish('profile:changedProfileImage', model["imageFileURI"]);
							self.setDirty(true);						
						})
					} else {
						console.log("no previous image to delete, so skipping that step...")
						console.log("uriAndSource = " + JSON.stringify(uriAndSource))

						self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_PROFILE, self.user["id"], uriAndSource["imageFileURI"]);

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

	onThumbnailPress($event) {
		let alert = this.alertCtrl.create({
			title: 'Delete Photo?',
			message: 'Do you want to DELETE your profile picture?',
			buttons: [
				{
					text: 'No', role: 'cancel', handler: () => {
						// do nothing
					},
				}, {
					text: 'Yes', handler: () => {
						let self = this;

						let func = () => {
							let model = self._profileService.getModel(self.user["id"]);

							model["imageFileURI"] = undefined;
							model["imageFileSource"] = undefined;

							self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_PROFILE, self.user["id"], model["imageFileURI"]);
						}

						console.log('deleting photo ' + self.user["id"]);

						self._pictureService.delete(self._constants.PHOTO_TYPE_PROFILE, self.user["id"]).then(() => { 

							let model = self._profileService.getModel(self.user["id"]);

							if (model["imageFileSource"] === 'camera' || model["imageFileSource"] === 'eog') {
								
								console.log("This image came from the camera, or the api.. deleting off the phone now. path=" + model['imageFileURI'] + "]")

								let lastSlash = model["imageFileURI"].lastIndexOf('/');
								let path = model["imageFileURI"].substring(0,lastSlash+1);
								let filename = model["imageFileURI"].substring(lastSlash+1);

								self._file.removeFile(path, filename).then((data) => {
									console.log("Call to pictureService to DELETE photo for "+self.user['id']+" successful! Image was from camera or the eog api, so it was removed from phone.");

									func();
									
								}).catch(() => {
									console.log("Caught error trying to remove file from phone");

									func();
								});
							} else {
								console.log("Call to pictureService to DELETE photo for "+self.user['id']+" successful! Image was from phone's gallery, so did not try to remove it.");

								func();								
							}

						}).catch(() => {
							console.log("An error occurred deleting the image from the server. Probably, it didn't exist there. Noting it, in case things look wonky..")

							func();
						});
					},
				}
			]
		});

		alert.present();
	}

	isThumbnailImageVisible() {
		return this.imageOrientation !== undefined;
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

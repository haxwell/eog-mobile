import { Component } from '@angular/core';

import { AlertController, ViewController, NavParams } from 'ionic-angular';
import { File } from '@ionic-native/file'

import { CameraService } from '../_services/camera.service';
import { ProfilePictureService } from '../../../app/_services/profile-picture.service'

@Component({
  selector: 'page-choose-photo-source',
  templateUrl: 'choose-photo-source.html'
})

export class ChoosePhotoSourcePage {

	imageFileURI: string = undefined;
	userId = undefined;

	constructor(private viewCtrl: ViewController, private cameraService: CameraService,
				private _profilePictureService: ProfilePictureService,
				private _alertCtrl: AlertController, public params: NavParams,
				private _file: File) {

		this.userId = params.get('userId') || -1;

	}

	onCameraBtnTap(evt) {
		let self = this;
		self.imageFileURI = undefined;
		
		self.viewCtrl.dismiss(new Promise((resolve, reject) => {
			self.cameraService.takePicture().then((imageFileURI: string) => { 
				console.log("just took a picture. Its at " + imageFileURI);
				self.imageFileURI = imageFileURI; 
				resolve(imageFileURI); 
			});
		}));
	}

	onGalleryBtnTap(evt) {
		let self = this;
		self.imageFileURI = undefined;

		self.viewCtrl.dismiss(new Promise((resolve, reject) => {
			self.cameraService.loadGalleryPicture().then((imageFileURI: string) => { 
				console.log("just set a picture from the gallery. Its at " + imageFileURI);
				self.imageFileURI = imageFileURI; 
				resolve(imageFileURI); 
			});
		}));
	}

	onDeleteBtnTap(evt) {
		let alert = this._alertCtrl.create({
			title: 'Delete Photo?',
			message: 'Do you want to delete your profile picture?',
			buttons: [
				{
					text: 'No', role: 'cancel', handler: () => {
						// do nothing
					},
				}, {
					text: 'Yes', handler: () => {
						let self = this;
						self.imageFileURI = undefined;

						console.log('deleting photo ' + self.userId);
						self.viewCtrl.dismiss(new Promise((resolve, reject) => {
							self._profilePictureService.delete(self.userId).then(() => { 
								self._file.removeFile(self._file.cacheDirectory, "eogAppProfilePic" + self.userId);

								console.log("Call to profilePictureService to DELETE photo for "+self.userId+" successful! Cached image removed from phone.");

								resolve(self.imageFileURI); 
							});
						}));
					},
				}
			]
		});

		alert.present();
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

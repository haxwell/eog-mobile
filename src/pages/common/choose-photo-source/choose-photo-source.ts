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
	imageFileSource: string = undefined;
	userId = undefined;

	constructor(private viewCtrl: ViewController, private cameraService: CameraService,
				private _profilePictureService: ProfilePictureService,
				private _alertCtrl: AlertController, public params: NavParams,
				private _file: File) {

		this.userId = params.get('userId') || -1;
		this.imageFileURI = params.get('fileURI');
		this.imageFileSource = params.get('fileSource');
	}

	onCameraBtnTap(evt) {
		let self = this;
		self.imageFileURI = undefined;
		
		self.viewCtrl.dismiss(new Promise((resolve, reject) => {
			self.cameraService.takePicture().then((imageFileURI: string) => { 

				self.imageFileURI = imageFileURI;
				console.log("just took a picture. Its at " + self.imageFileURI);
				
				resolve({imageFileSource: 'camera', imageFileURI: self.imageFileURI});
			});
		}));
	}

	onGalleryBtnTap(evt) {
		let self = this;
		self.imageFileURI = undefined;

		self.viewCtrl.dismiss(new Promise((resolve, reject) => {
			self.cameraService.loadGalleryPicture().then((imageFileURI: string) => { 

				self.imageFileURI = imageFileURI;
				console.log("just set a picture from the gallery. Its at " + self.imageFileURI);

				resolve({imageFileSource: 'gallery', imageFileURI: self.imageFileURI});
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

						let lastSlash = self.imageFileURI.lastIndexOf('/');
						let path = self.imageFileURI.substring(0,lastSlash+1);
						let filename = self.imageFileURI.substring(lastSlash+1);

						console.log('deleting photo ' + self.userId);
						self.viewCtrl.dismiss(new Promise((resolve, reject) => {
							self._profilePictureService.delete(self.userId).then(() => { 
								if (self.imageFileSource === 'camera' || self.imageFileSource === 'eog') {
									self._file.removeFile(path, filename).then((data) => {
										console.log("Call to profilePictureService to DELETE photo for "+self.userId+" successful! Image was from camera or the eog api, so it was removed from phone.");
										console.log("ChoosePhotoSource is returning [undefined], since the action take was to delete the photo, so no photo path exists anymore");										
										resolve(undefined); 
									});
								} else {
									console.log("Call to profilePictureService to DELETE photo for "+self.userId+" successful! Image was from phone's gallery, so did not try to remove it.");
									console.log("ChoosePhotoSource is returning [undefined], since the action take was to delete the photo, so no photo path exists anymore");
									resolve(undefined);
								}

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

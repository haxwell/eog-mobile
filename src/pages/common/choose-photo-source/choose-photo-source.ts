import { Component } from '@angular/core';

import { AlertController, ViewController, NavParams } from 'ionic-angular';
import { File } from '@ionic-native/file'

import { CameraService } from '../_services/camera.service';

@Component({
  selector: 'page-choose-photo-source',
  templateUrl: 'choose-photo-source.html'
})

export class ChoosePhotoSourcePage {

	imageFileURI: string = undefined;
	imageFileSource: string = undefined;
	userId = undefined;

	constructor(private viewCtrl: ViewController, private cameraService: CameraService,
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

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

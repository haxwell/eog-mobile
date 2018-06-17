import { Component } from '@angular/core';

import { ViewController, NavParams } from 'ionic-angular';

import { CameraService } from '../_services/camera.service';

@Component({
  selector: 'page-choose-photo-source',
  templateUrl: 'choose-photo-source.html'
})

export class ChoosePhotoSourcePage {

	imageFileURI: string = undefined;
	imageFileSource: string = undefined;

	constructor(private viewCtrl: ViewController, private cameraService: CameraService,
				public params: NavParams) {

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

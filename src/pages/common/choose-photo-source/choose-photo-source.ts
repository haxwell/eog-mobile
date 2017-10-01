import { Component } from '@angular/core';

import { ViewController } from 'ionic-angular';

import { CameraService } from '../_services/camera.service';

@Component({
  selector: 'page-choose-photo-source',
  templateUrl: 'choose-photo-source.html'
})

export class ChoosePhotoSourcePage {

	imageFileURI: string = undefined;

	constructor(private viewCtrl: ViewController, private cameraService: CameraService) {

	}

	onCameraBtnTap(evt) {
		let self = this;
		self.imageFileURI = undefined;
		
		self.viewCtrl.dismiss(new Promise((resolve, reject) => {
			self.cameraService.takePicture().then((imageFileURI: string) => { 
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
				self.imageFileURI = imageFileURI; 
				resolve(imageFileURI); 
			});
		}));
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

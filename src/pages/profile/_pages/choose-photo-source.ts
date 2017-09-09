import { Component } from '@angular/core';

import { ViewController } from 'ionic-angular';

import { CameraService } from '../_services/camera.service';

@Component({
  selector: 'page-choose-photo-source',
  templateUrl: 'choose-photo-source.html'
})

export class ChoosePhotoSourcePage {

	imageAsString: string = undefined;

	constructor(private viewCtrl: ViewController, private cameraService: CameraService) {

	}

	onCameraBtnTap(evt) {
		let self = this;
		self.imageAsString = undefined;
		
		self.viewCtrl.dismiss(new Promise((resolve, reject) => {
			self.cameraService.takePicture().then((imgAsString: string) => { self.imageAsString = imgAsString; resolve(imgAsString); });
		}));
	}

	getImageAsString() {
		return this.imageAsString;
	}

	onGalleryBtnTap(evt) {
		let self = this;
		self.imageAsString = undefined;

		self.viewCtrl.dismiss(new Promise((resolve, reject) => {
			self.cameraService.loadGalleryPicture().then((imgAsString: string) => { self.imageAsString = imgAsString; resolve(imgAsString); });
		}));
	}
}

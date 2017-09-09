import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';

import { environment } from '../../../_environments/environment';


@Injectable()
export class CameraService {
	
	base64Image: string = undefined;
	
	constructor(private _apiService: ApiService, 
				private _userService: UserService,
				private _camera: Camera) { 

	}

	init() {

	}

	takePicture() {
		let self = this;

		return new Promise((resolve, reject) => {
			console.log("onThumbnailPress() called");
			const options: CameraOptions = {
			 	quality: 100,
			 	destinationType: self
			 	._camera.DestinationType.DATA_URL,
			 	encodingType: self
			 	._camera.EncodingType.JPEG,
			 	mediaType: self
			 	._camera.MediaType.PICTURE
			}

			self._camera.getPicture(options).then((imageData) => {
			 	// imageData is either a base64 encoded string or a file URI
			 	if (self.isBase64(imageData)) {
			 		self.base64Image = 'data:image/jpeg;base64,' + imageData;
			 		resolve(self.base64Image);
			 	} else {
			 		// Handle error
			 	}
			}, (err) => {
			 	// Handle error
			});
		})
	}

	isBase64(data) {
		var base64Regex = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;
		return base64Regex.test(data); // data is the base64 string
	}

	loadGalleryPicture() {
		let self = this;

		return new Promise((resolve, reject) => {
			const options: CameraOptions = {
			 	mediaType: self._camera.MediaType.PICTURE,
			 	sourceType: self._camera.PictureSourceType.PHOTOLIBRARY,
			 	destinationType: self._camera.DestinationType.DATA_URL
			}

			self._camera.getPicture(options).then((imageData) => {
			 	// imageData is either a base64 encoded string or a file URI
			 	if (self.isBase64(imageData)) {
			 		self.base64Image = 'data:image/jpeg;base64,' + imageData;
			 		resolve(self.base64Image);
			 	} else {
			 		// Handle error
			 	}
			}, (err) => {
			 	// Handle error
			});
		})
	}
}

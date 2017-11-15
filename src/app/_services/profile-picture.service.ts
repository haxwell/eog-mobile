import { Injectable } from '@angular/core';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file'

import { ApiService } from './api.service'
import { FunctionPromiseService } from './function-promise.service';

import { Constants } from '../../_constants/constants';

import { environment } from '../../_environments/environment';

@Injectable()
export class ProfilePictureService { 

	_functionPromiseService = new FunctionPromiseService();

	constructor(private _apiService: ApiService,
				private _constants: Constants,
				private transfer: FileTransfer,
				private file: File) { 

	}

	init() {

		// Why do we do this? Why not just define and call a function?

		// because this gives us a framework, to call the method, and reuse the promise from it.
		//  we get the promise once, and return it over and over. Otherwise, we'd get a new promise
		//  (and new API call) each time, unless we figured a way to save the original promise.
		//  which is what this is. part of, anyway.

		// We don't put the SET/DELETE functionality in the framework because it will not be repeatedly called 
		//  by Angular; only once when the button is pushed.

		let self = this;
		self._functionPromiseService.initFunc(self._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, (id, photoPath) => {
			let rtn = new Promise((resolve, reject) => {

				let lastSlash = photoPath.lastIndexOf('/');
				let path = photoPath.substring(0,lastSlash+1);
				let filename = photoPath.substring(lastSlash+1);

				self.file.checkFile(path, filename).then((isFileExists) => {
					if (isFileExists) {
						console.log("THE GET FUNC: image already exists on phone. returning its path as " + path + filename)
						resolve(path + filename);
					} 
				}).catch(e => { 

					console.log("THE GET FUNC: image does not already exist on phone. Not found at " + path + filename)

				    let url = environment.apiUrl + "/api/user/" + id + "/profile/picture/isFound";
				    this._apiService.get(url).subscribe((isFound) => {
				    	if (isFound["_body"] == "true") {
							url = environment.apiUrl + "/api/user/" + id + "/profile/picture";
							const fileTransfer: FileTransferObject = self.transfer.create();

							console.log("image download about to initiate....");
							fileTransfer.download(url, path + filename).then((entry) => {
							    resolve(path + filename);
							    console.log('download complete: ' + entry.toURL());
					  		}, (error) => {
					    		// handle error
					    		console.log(error);
					    		reject();
					  		});

				    	} else {
				    		console.log("THE GET FUNC: API does not have an image for " + id + ". Returning undefined.")
							resolve(undefined);
				    	}
				    });
				});

			});

			return rtn;
		});	
	}

	reset(userId) {
		return this._functionPromiseService.reset(userId);
	}

	get(userId, data) {
		console.log("PPS: Making call to FPS to get Promise containing the URL for the profile photo of user " + userId);
		return this._functionPromiseService.get(userId, this._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, data);
	}

	delete(userId) {
		console.log("PPS: userId " + userId +" returning promise which calls API to delete profile picture.");
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/user/" + userId + "/profile/picture";
			this._apiService.delete(url).subscribe((data) => {
				resolve(data);
			})
		});
	}

	save(userId, filename) {
		return new Promise((resolve, reject) => {
			if (filename !== undefined) {
				console.log("image upload about to initiate....");
				const fileTransfer: FileTransferObject = this.transfer.create();

				let options: FileUploadOptions = {
				     fileKey: 'file',
				     fileName: filename, 
				     headers: {}
				}

				fileTransfer.upload(filename, environment.apiUrl + "/api/user/" + userId + "/profile/picture", options)
				   .then((data) => {
				     // success
				     console.log("image upload succeeded");
				     console.log(data);

					let lastSlash = filename.lastIndexOf('/');
					let lastQuestionMark = filename.lastIndexOf('?');

					if (lastQuestionMark === -1) 
						lastQuestionMark = filename.length;

				     this.file.copyFile(filename.substring(0,lastSlash+1), // path
				     					filename.substring(lastSlash+1, lastQuestionMark), // relative filename
				     					this.file.cacheDirectory, // to path
				     					"eogAppProfilePic" + userId // to relative filename
				     					).then(() => {
				     	resolve(data);
				     }).catch(e => { 
				     	console.log(e);
				     	reject();
				     });

				   }, (err) => {
				     // error
				     console.log(err);
				     reject();
				   });
			} else {
				resolve(undefined);
			}
		});
	}
}
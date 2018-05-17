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
			
			console.log("In PROFILE_PICTURE_GET, and the photoPath = [" + photoPath + "]");

			let rtn = new Promise((resolve, reject) => {

				let lastSlash = photoPath.lastIndexOf('/');
				let path = photoPath.substring(0,lastSlash+1);
				let filename = photoPath.substring(lastSlash+1);

				self.file.checkFile(path, filename).then((isFileExists) => {
					if (isFileExists) {
						console.log("PROFILE_PICTURE_GET says this file exists! Resolving " + (path+filename));
						resolve(path + filename);
					} 
				}).catch(e => { 
					console.log("PROFILE_PICTURE_GET got an error checking on [" + (path+filename) + "]. Calling the API to see if the picture is there.");
				    let url = environment.apiUrl + "/api/user/" + id + "/profile/picture/isFound";
				    this._apiService.get(url).subscribe((isFound) => {
				    	if (isFound["_body"] == "true") {
				    		console.log("PROFILE_PICTURE_GET received TRUE from the API, so we're downloading the file.");
							url = environment.apiUrl + "/api/user/" + id + "/profile/picture";
							const fileTransfer: FileTransferObject = self.transfer.create();

							fileTransfer.download(url, path + filename).then((entry) => {
							    resolve(path + filename);
					  		}, (error) => {
					    		// handle error
					    		reject();
					  		});

				    	} else {
				    		console.log("PROFILE_PICTURE_GET received [" + isFound['_body'] + "] from the /profile/picture/isFound API, so we're returning undefined.");
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
		return this._functionPromiseService.get(userId, this._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, data);
	}

	delete(userId) {

		// delete the profile picture from the server, so other users won't see it either

		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/user/" + userId + "/profile/picture";
			this._apiService.delete(url).subscribe((data) => {
				console.log("Call to delete api returned: " + JSON.stringify(data))
				resolve(data);
			})
		});
	}

	save(userId, filename) {
		return new Promise((resolve, reject) => {
			if (filename !== undefined) {
				const fileTransfer: FileTransferObject = this.transfer.create();

				let options: FileUploadOptions = {
				     fileKey: 'file',
				     fileName: filename, 
				     headers: {}
				}

				fileTransfer.upload(filename, environment.apiUrl + "/api/user/" + userId + "/profile/picture", options)
				   .then((data) => {
				     // success

				    console.log("successfully uploaded profile picture to server")

					let lastSlash = filename.lastIndexOf('/');
					let lastQuestionMark = filename.lastIndexOf('?');

					if (lastQuestionMark === -1) 
						lastQuestionMark = filename.length;

				     let path = filename.substring(0,lastSlash+1);
				     let relativeFilename = filename.substring(lastSlash+1, lastQuestionMark);

				     this.file.copyFile(path, // path
				     					relativeFilename, // relative filename
				     					this.file.cacheDirectory, // to path
				     					"eogAppProfilePic" + userId // to relative filename
				     					).then(() => {
				     	resolve({path: path, relativeFilename: relativeFilename});
				     }).catch(e => { 
				     	reject();
				     });

				   }, (err) => {
				     // error
				     console.log("** error uploading profile picture to server");
				     console.log(err);
				     reject();
				   });
			} else {
				resolve(undefined);
			}
		});
	}
}
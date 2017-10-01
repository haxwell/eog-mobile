import { Injectable } from '@angular/core';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file'

import { FunctionPromiseService } from './function-promise.service';

import { Constants } from '../../_constants/constants';

import { environment } from '../../_environments/environment';

@Injectable()
export class ProfilePictureService { 

	_functionPromiseService = new FunctionPromiseService();

	constructor(private _constants: Constants,
				private transfer: FileTransfer,
				private file: File) { 

	}

	init() {

		// Why do we do this? Why not just define and call a function?

		// because this gives us a framework, to call the method, and reuse the promise from it.
		//  we get the promise once, and return it over and over. Otherwise, we'd get a new promise
		//  (and new API call) each time, unless we figured a way to save the original promise.
		//  which is what this is. part of, anyway.

		// We don't put the SET functionality in the framework because it will not be repeatedly called 
		//  by Angular; only once when the profile is saved.

		this._functionPromiseService.initFunc(this._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, (id) => {
			return new Promise((resolve, reject) => {
				let url = environment.apiUrl + "/api/user/" + id + "/profile/picture";
				const fileTransfer: FileTransferObject = this.transfer.create();

				console.log("image download about to initiate....");
				fileTransfer.download(url, this.file.dataDirectory + "eogAppProfilePic" + id).then((entry) => {
				    resolve(this.file.dataDirectory + "eogAppProfilePic" + id);
				    console.log('download complete: ' + entry.toURL());
		  		}, (error) => {
		    		// handle error
		    		console.log(error);
		    		reject();
		  		});
			})
		});
	}

	reset(userId) {
		return this._functionPromiseService.reset(userId);
	}

	get(userId) {
		return this._functionPromiseService.get(userId, this._constants.FUNCTION_KEY_PROFILE_PICTURE_GET);
	}

	save(userId, filename) {
		return new Promise((resolve, reject) => {
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

			     resolve(data);
			   }, (err) => {
			     // error
			     console.log(err);
			     reject();
			   });
		});
	}
}
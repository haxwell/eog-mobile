import { Injectable } from '@angular/core';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file'

import { LocalStorageService } from 'angular-2-local-storage';

import { ApiService } from './api.service'
import { FunctionPromiseService } from './function-promise.service';

import { Constants } from '../../_constants/constants';

import { environment } from '../../_environments/environment';

@Injectable()
export class PictureService { 

	_functionPromiseService = new FunctionPromiseService();

	constructor(private _apiService: ApiService,
				private _constants: Constants,
				private transfer: FileTransfer,
				private _localStorageService: LocalStorageService,
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
		

		// THE PURPOSE of this function is to get the most up to date profile picture for a given ID.
		//
		// You pass in the id, and a path to check an existing file.
		//
		////////
		self._functionPromiseService.initFunc(self._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, (id, data) => {
			
			let photoType = data["photoType"];
			let photoPath = data["path"];

			let rtn = new Promise((resolve, reject) => {

				if (photoType != self._constants.PHOTO_TYPE_PROFILE && photoType != self._constants.PHOTO_TYPE_PRM)
					reject();

				console.log("In PROFILE_PICTURE_GET, photoType = [" + photoType + "] and the photoPath = [" + photoPath + "]");

				let lastSlash = photoPath.lastIndexOf('/');
				let path = photoPath.substring(0,lastSlash+1);
				let filename = photoPath.substring(lastSlash+1);

				// check the API, it returns the timestamp of the file it has. Client checks
			    let url = environment.apiUrl + "/api/resource/" + photoType + "/" + id + "/isFound";
			    self._apiService.get(url).subscribe((pictureAPITimestamp) => {

			    	console.log("Call to api /isFound[" +id+"] succeeded. returned [ " + pictureAPITimestamp["_body"]*1 + " ]");
	
					if (pictureAPITimestamp["_body"]*1 > 0) { // meaning, this file exists on the API

						console.log("API Timestamp is greater than 0, so the profile photo for "+id+" does indeed exist there.");

						// now we need the timestamp of the file on this local device we're running on...
						self.file.checkFile(path, filename).then((fileExists) => {
							
							console.log("File exists on device: " + path+filename)

							var millis = this._localStorageService.get(path+filename);

							console.log("localStorage millis timestamp for " + (path+filename) + " is [" + millis + "]. The API has [" + pictureAPITimestamp["_body"]*1 + "] for a timestamp.");

							if (millis < pictureAPITimestamp["_body"]*1) {
								//download the api picture

								console.log("The API picture is newer than the one we have. Downloading from the API.")

								url = environment.apiUrl + "/api/resource/" + photoType + "/" + id;
								const fileTransfer: FileTransferObject = self.transfer.create();

								fileTransfer.download(url, path + filename).then((entry) => {
								    console.log("-- just downloaded the pic for " + id)

									var millis = new Date().getTime();

									console.log("== setting the localStorage timestamp for this file to: " + millis);

									this._localStorageService.set(path+filename, millis);

								    resolve(path + filename);
						  		}, (error) => {
						    		// handle error
						    		reject();
						  		});

							} else {
								console.log("The "+photoType+" picture on the phone is newer than the API's photo! So we WILL NOT download from the server.")
								resolve(path+filename);
							}

						}).catch(e => {
							// call to checkfile failed.. the file likely does not exist.. regardless try downloading it from the server.
							console.log("-- Error calling checkFile " + JSON.stringify(e));
							
							url = environment.apiUrl + "/api/resource/" + photoType + "/" + id;
							const fileTransfer: FileTransferObject = self.transfer.create();

							fileTransfer.download(url, path + filename).then((entry) => {
							    console.log("-- just downloaded the " + photoType + " pic for " + id)

								var millis = new Date().getTime();

								console.log("== setting the localStorage timestamp for this file to: " + millis);

								this._localStorageService.set(path+filename, millis);

							    resolve(path + filename);
					  		}, (error) => {
					    		// handle error
					    		reject();
					  		});
						})

					} else { // meaning the file does not exist on the API

						console.log("API Timestamp is 0, so the "+ photoType +" photo for "+id+" did not exist API-side.");

						// then we need to check locally is there a file.
						self.file.checkFile(path, filename).then((isFileExists) => {
							if (isFileExists) {
								console.log("PICTURE_GET says this file exists, but it is stale. Removing from the device.");

								// we need to remove this file. A file that does not exist on the server is stale. 
								self.file.removeFile(path, filename).then((promiseResult) => {
									
								})

								// there's no photo, so we can resolve undefined.
								resolve(undefined);
							} 
						}).catch(e => { 
							// If not on the phone, return undefined
							console.log(photoType + " Photo for " + id + " not found on phone or api, returning an undefined path");
							resolve(undefined)
						})
					}

				}, () => 	{ 
					console.log("ERROR #photo-rxp9r");
				})
			});

			return rtn;
		});	
	}

	reset(photoType, objId) {
		return this._functionPromiseService.reset(photoType+objId);
	}

	get(photoType, objId, path) {
		let data = {photoType: photoType, path: path}
		return this._functionPromiseService.get(objId, this._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, data);
	}

	delete(photoType, objId) {

		// delete the picture from the server, so other users won't see it either
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/resource/" + photoType + "/" + objId;
			this._apiService.delete(url).subscribe((data) => {
				console.log("Call to delete api returned: " + JSON.stringify(data))
				resolve(data);
			})
		});
	}

	save(photoType, objId, filename) {
		return new Promise((resolve, reject) => {
			if (filename !== undefined) {
				const fileTransfer: FileTransferObject = this.transfer.create();

				let options: FileUploadOptions = {
				     fileKey: 'file',
				     fileName: filename, 
				     headers: {}
				}

				fileTransfer.upload(filename, environment.apiUrl + "/api/resource/" + photoType + "/" + objId, options)
				   .then((data) => {
				     // success

				    console.log("successfully uploaded "+photoType+" picture to server")

					let lastSlash = filename.lastIndexOf('/');
					let lastQuestionMark = filename.lastIndexOf('?');

					if (lastQuestionMark === -1) 
						lastQuestionMark = filename.length;

				     let path = filename.substring(0,lastSlash+1);
				     let relativeFilename = filename.substring(lastSlash+1, lastQuestionMark);

				     this.file.copyFile(path, // path
				     					relativeFilename, // relative filename
				     					this.file.cacheDirectory, // to path
				     					"eogApp" +photoType+ "Pic" + objId // to relative filename
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
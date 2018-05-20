import { Injectable } from '@angular/core';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file'

import { LocalStorageService } from 'angular-2-local-storage';

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
		self._functionPromiseService.initFunc(self._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, (id, photoPath) => {
			
			let rtn = new Promise((resolve, reject) => {

				console.log("In PROFILE_PICTURE_GET, and the photoPath = [" + photoPath + "]");

				let lastSlash = photoPath.lastIndexOf('/');
				let path = photoPath.substring(0,lastSlash+1);
				let filename = photoPath.substring(lastSlash+1);

				// check the API, it returns the timestamp of the file it has. Client checks
			    let url = environment.apiUrl + "/api/user/" + id + "/profile/picture/isFound";
			    self._apiService.get(url).subscribe((profilePictureAPITimestamp) => {

			    	console.log("Call to api /isFound succeeded. returned [ " + profilePictureAPITimestamp["_body"]*1 + " ]");
	
					if (profilePictureAPITimestamp["_body"]*1 > 0) { // meaning, this file exists on the API

						console.log("API Timestamp is greater than 0, so the profile photo for "+id+" does indeed exist there.");

						// now we need the timestamp of the file on this local device we're running on...
						self.file.checkFile(path, filename).then((fileExists) => {
							
							console.log("File exists: " + path+filename)

							var millis = this._localStorageService.get(path+filename);

							if (millis < profilePictureAPITimestamp) {
								//download the api picture

								console.log("The API profile picture is newer than the one we have. Downloading from the API.")

								url = environment.apiUrl + "/api/user/" + id + "/profile/picture";
								const fileTransfer: FileTransferObject = self.transfer.create();

								fileTransfer.download(url, path + filename).then((entry) => {
								    console.log("-- just downloaded the profile pic for " + id)

									var millis = new Date().getTime();

									console.log("== setting the localStorage timestamp for this file to: " + millis);

									this._localStorageService.set(path+filename, millis);

								    resolve(path + filename);
						  		}, (error) => {
						    		// handle error
						    		reject();
						  		});

							} else {
								resolve(path+filename);
							}


						}).catch(e => {
							// call to checkfile failed.. the file likely does not exist.. regardless try downloading it from the server.
							console.log("-- Error calling checkFile " + JSON.stringify(e));
							
							url = environment.apiUrl + "/api/user/" + id + "/profile/picture";
							const fileTransfer: FileTransferObject = self.transfer.create();

							fileTransfer.download(url, path + filename).then((entry) => {
							    console.log("-- just downloaded the profile pic for " + id)

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

						console.log("API Timestamp is 0 (right?), so the profile photo for "+id+" did not exist there.");

						// then we need to check locally is there a file.
						self.file.checkFile(path, filename).then((isFileExists) => {
							if (isFileExists) {
								console.log("PROFILE_PICTURE_GET says this file exists, but it is stale. Removing from the device.");

								// we need to remove this file. A file that does not exist on the server is stale. 
								self.file.removeFile(path, filename).then((promiseResult) => {
									
								})

								// no need to wait, we can resolve undefined right now.
								resolve(undefined);
							} 
						}).catch(e => { 
							// If not on the phone, return undefined
							console.log("Profile Photo for " + id + " not found on phone or api, returning an undefined path");
							resolve(undefined)
						})
					}

				}, () => 	{ 
					console.log("ERROR #rxp9r");
				})
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
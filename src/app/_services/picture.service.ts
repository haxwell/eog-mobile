import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

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
	mostProbablePhotoPath = {};
	platformName = undefined;

	constructor(private _platform: Platform,
				private _apiService: ApiService,
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
		//  which is what this is. part of, anyway. Also, the functionPromiseService allows us to 
		//  expire the results after a certain amount of time, keeping our results fresh.

		// We don't put the SET/DELETE functionality in the framework because it will not be repeatedly called 
		//  by Angular; only once when the button is pushed.

		let self = this;
		

		// THE PURPOSE of this function is to get the most up to date profile picture for a given ID.
		//
		// You pass in the objId, and a path to check an existing file.
		//
		////////
		self._functionPromiseService.initFunc(self._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, (data) => {

			let objId = data["objId"];
			let photoType = data["photoType"];
			let photoPath = data["path"];

			let rtn = new Promise((resolve, reject) => {

				if (!photoPath)
					resolve(undefined);

				if (!objId)
					resolve(undefined);

				if (photoType != self._constants.PHOTO_TYPE_PROFILE && photoType != self._constants.PHOTO_TYPE_PRM)
					resolve(undefined);

				let lastSlash = photoPath.lastIndexOf('/');
				let path = photoPath.substring(0,lastSlash+1);
				let filename = photoPath.substring(lastSlash+1);

				// check the API, it returns the timestamp of the file it has. Client checks
			    let url = environment.apiUrl + "/api/resource/" + photoType + "/" + objId + "/isFound";
			    self._apiService.get(url).subscribe((pictureAPITimestamp) => {

					if (pictureAPITimestamp["_body"]*1 > 0) { // meaning, this file exists on the API

						// now we need the timestamp of the file on this local device we're running on...
						self.file.checkFile(path, filename).then((fileExists) => {
							
							var millis = this._localStorageService.get(path+filename);
							if (millis < pictureAPITimestamp["_body"]*1) {
								//download the api picture

								url = environment.apiUrl + "/api/resource/" + photoType + "/" + objId;
								const fileTransfer: FileTransferObject = self.transfer.create();

								fileTransfer.download(url, path + filename).then((entry) => {
									var millis = new Date().getTime();
									this._localStorageService.set(path+filename, millis);

								    resolve(path + filename);
						  		}, (err) => {
						    		// handle error
						    		console.log("Error downloading file, url = " + url + ", path+filename = " + (path+filename))
						    		console.log(JSON.stringify(err))
						    		resolve(undefined);
						  		});

							} else {
								resolve(path+filename);
							}

						}).catch(e => {
							// call to checkfile failed.. the file likely does not exist.. regardless try downloading it from the server.

							url = environment.apiUrl + "/api/resource/" + photoType + "/" + objId;
							const fileTransfer: FileTransferObject = self.transfer.create();

							fileTransfer.download(url, path + filename).then((entry) => {
								var millis = new Date().getTime();
								this._localStorageService.set(path+filename, millis);

							    resolve(path + filename);
					  		}, (err) => {
					    		// handle error
					    		console.log("Error downloading file, url = " + url + ", path+filename = " + (path+filename))
					    		console.log(JSON.stringify(err))
					    		resolve(undefined);
					  		});
						})

					} else { // meaning the file does not exist on the API

						// then we need to check locally is there a file.
						self.file.checkFile(path, filename).then((isFileExists) => {
							if (isFileExists) {

								// we need to remove this file. A file that does not exist on the server is stale. 
								self.file.removeFile(path, filename).then((promiseResult) => {

								})

								// there's no photo, so we can resolve undefined.
								resolve(undefined);
							} 
						}).catch(err => { 
							if (err["code"] !== 1 || err["message"] !== "NOT_FOUND_ERR") {
								console.log("Error checking if exists file: " + path + ", " + filename)
								console.log(JSON.stringify(err))
							}

							resolve(undefined)
						})
					}

				}, (err) => 	{ 
					console.log("ERROR #photo-rxp9r");
					console.log(err);
					resolve(undefined);
				})
			});

			return rtn;
		});	
	}

	reset(photoType, objId) {
		return this._functionPromiseService.reset(photoType+objId);
	}

	get(photoType, objId) {
		let data = {photoType: photoType, objId: objId, path: this.getMostProbablePhotoPath(photoType, objId)}
		return this._functionPromiseService.get(photoType+objId, this._constants.FUNCTION_KEY_PROFILE_PICTURE_GET, data);
	}

	delete(photoType, objId) {

		// delete the picture from the server, so other users won't see it either
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/resource/" + photoType + "/" + objId;
			this._apiService.delete(url).subscribe((data) => {
				resolve(data);
			}, (err) => {
				reject(err);
			})
		});
	}

	save(photoType, objId, filename) {
		let self = this;
		return new Promise((resolve, reject) => {
			if (filename !== undefined) {
				console.log("PictureService is about to upload a file....")
				const fileTransfer: FileTransferObject = this.transfer.create();

				let options: FileUploadOptions = {
				     fileKey: 'file',
				     fileName: filename, 
				     headers: {}
				}

				fileTransfer.upload(filename, environment.apiUrl + "/api/resource/" + photoType + "/" + objId, options)
				   .then((data) => {
				    // success
				    // console.log("File upload from picture service was a success...");

				    let photoTypeFilename = "eogApp" +photoType+ "Pic" + objId

				    let func = () => { 
						let lastSlash = filename.lastIndexOf('/');
						let lastQuestionMark = filename.lastIndexOf('?');

						if (lastQuestionMark === -1) 
							lastQuestionMark = filename.length;

					    let path = filename.substring(0,lastSlash+1);
					    let relativeFilename = filename.substring(lastSlash+1, lastQuestionMark);

					    //console.log("copying file to cache directory. from [" + path + ", " + relativeFilename + "] to [" + this.file.cacheDirectory + "]");

					    this.file.copyFile(path, // path
					     					relativeFilename, // relative filename
					     					this.file.cacheDirectory, // to path
					     					photoTypeFilename // to relative filename
					     					).then(() => {
					     	this.reset(photoType, objId);
					     	resolve({path: path, relativeFilename: relativeFilename});
					    }).catch(err => { 
					     	console.log("Error copying file. filename = " + filename)
					     	console.log(JSON.stringify(err));
					     	reject();
					    });
				    }

					self.file.checkFile(this.file.cacheDirectory, photoTypeFilename).then((isFileExists) => {
						if (isFileExists) {
							// we need to remove this file, and replace it with this currently-being-saved picture 
							self.file.removeFile(this.file.cacheDirectory, photoTypeFilename).then((promiseResult) => {
								func();
							}).catch((err) => {
								console.log("Error removing existing file in the process of replacing it with a new file of the same name, in picture.service")
								console.log(JSON.stringify(err))
								reject();
							})
						} else {
							func();
						}

					}).catch(err => { 
						if (err["code"] === 1 && err["message"] === "NOT_FOUND_ERR")
							func();
						else {
							console.log("Error checking if [" + self.file.cacheDirectory + "/" + photoTypeFilename + "] exists. This is more than the file not existing... :(");
							console.log(JSON.stringify(err))
							reject();
						}
					})				     

				}, (err) => {
					// error
					console.log("Error uploading file in pictureService::save()")
					console.log(JSON.stringify(err));
					reject();
				});
			} else {
				this.reset(photoType, objId);
				resolve(undefined);
			}
		});
	}

	setMostProbablePhotoPath(photoType, objId, str) {
		this.mostProbablePhotoPath[photoType+objId] = str;
	}

	getMostProbablePhotoPath(photoType, objId) {
        if (this.mostProbablePhotoPath[photoType+objId] === undefined) {
            let cacheDirectory = undefined;

            if (this._platform.is('android') || this._platform.is('ios')) {
            	this.mostProbablePhotoPath[photoType+objId] = this.file.cacheDirectory + (photoType+objId);
            } else {
            	this.mostProbablePhotoPath[photoType+objId] = undefined;
            }
        }

		return this.mostProbablePhotoPath[photoType+objId];
	}

	getOrientationCSS(objWithImageOrientationAttr: any, additionalCSSClassList?: string) {
		let obj = objWithImageOrientationAttr;

		let rtn = "";

		if (this._platform.is('android')) {
			if (obj["imageOrientation"] === 8)
				 rtn = "rotate90Counterclockwise";
			else if (obj["imageOrientation"] === 3)
				rtn = "rotate180";
			else if (obj["imageOrientation"] === 6)
				rtn = "rotate90Clockwise";
		}

		rtn += " centered " + additionalCSSClassList || '';

		return rtn;
	}
}

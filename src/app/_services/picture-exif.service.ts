import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file'

import { Constants } from '../../_constants/constants'
import { FunctionPromiseService } from './function-promise.service'

import EXIF from 'exif-js';

@Injectable()
export class PictureEXIFService { 

	_functionPromiseService = new FunctionPromiseService();
	isInitialized = false;

	constructor(private file: File, private _constants: Constants) { 

	}

	init() {
		let self = this;

		self._functionPromiseService.initFunc(self._constants.FUNCTION_KEY_EXIF_METADATA_GET, (photoPath) => {
			let rtn = new Promise((resolve, reject) => {
				
				let lastSlash = photoPath.lastIndexOf('/');
				let path = photoPath.substring(0,lastSlash+1);
				let filename = photoPath.substring(lastSlash+1);

				if (filename.lastIndexOf('?') !== -1)
					filename = filename.substring(0, filename.lastIndexOf('?'))

				this.file.readAsArrayBuffer(path, filename).then((arrBuff) => {
					resolve(EXIF.readFromBinaryFile(arrBuff));
				}).catch((e) => {
					console.log("caught an error retrieving photo metadata")
					console.log(JSON.stringify(e))
				})
			});

			return rtn;
		})

		this.isInitialized = true;
	}

	reset(photoPath) {
		if (!this.isInitialized)
			this.init();

		this._functionPromiseService.reset(photoPath);
	}

	getEXIFMetadata(photoPath) {
		if (!this.isInitialized)
			this.init();

		return this._functionPromiseService.get(photoPath, this._constants.FUNCTION_KEY_EXIF_METADATA_GET, photoPath);
	}

}
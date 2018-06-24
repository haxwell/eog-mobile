import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file'

import EXIF from 'exif-js';

@Injectable()
export class PictureEXIFService { 

	constructor(private file: File) { 

	}

	getEXIFMetadata(photoPath) {
		return new Promise((resolve, reject) => {
			let lastSlash = photoPath.lastIndexOf('/');
			let path = photoPath.substring(0,lastSlash+1);
			let filename = photoPath.substring(lastSlash+1);

			if (filename.lastIndexOf('?') !== -1)
				filename = filename.substring(0, filename.lastIndexOf('?'))

			this.file.readAsArrayBuffer(path, filename).then((arrBuff) => {
				resolve(EXIF.readFromBinaryFile(arrBuff));
			}).catch((e) => {
				console.log("caught an error")
				console.log(JSON.stringify(e))
			})
		})
	}

}
import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';

@Injectable()
export class GeolocationService { 

	API_KEY = "AIzaSyCUQEnW_Z6Oz3Y5_nYY98sR90pKyYbbdkI";

	constructor(private _http: Http,
				private _geolocation: Geolocation) {

	}

	getCurrentPosition() {
		let self = this;
		
		return new Promise(
			(resolve, reject) => {
				let options = {
					timeout: 6000
				};

				this._geolocation.getCurrentPosition(options).then((resp) => {
					resolve(resp);
				}, (err) => {
					reject("err!!");
				})
			});
	}

	getLatlongFromCityState(city: string, state: string) {
		let url = 'https://maps.googleapis.com/maps/api/geocode/json?address="' + city + ',' + state + '"&key=' + this.API_KEY;

		return new Promise(
			(resolve, reject) => {
				this._http.get(url).subscribe(
					(b) => { 
						let rtn = {};

						let data = Object.assign({}, JSON.parse(b["_body"]));
						let obj = data["results"][0].geometry.location;

						rtn["latitude"] = obj.lat;
						rtn["longitude"] = obj.lng;

					 	resolve(rtn);
					}, (err) => {
						reject(err);
					});
			});
	}

	getCityStateFromLatlong(latitude, longitude) {
		let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&result_type=administrative_area_level_1|locality' + '&key=' + this.API_KEY;

		return new Promise(
			(resolve, reject) => {
				this._http.get(url).subscribe(
					(b) => { 
						let rtn = {};

						let data = Object.assign({}, JSON.parse(b["_body"]));
						
						if (data["results"][0] && data["results"][0].address_components) {
							let obj = data["results"][0].address_components

							// TODO: Instead of assuming the values we're looking for will always be in the same place,
							//  a better implementation would be to iteratr through each value in "address_components", 
							//  and look for the one with "types=locality,political" and set that to city, and the one
							//  with "types=administrative_area_level_1,political", set that to state. Check the JSON
							//  returned from this API call to see what I mean.

							rtn["city"] = obj[0].long_name;
							rtn["state"] = obj[2].short_name;

						 	resolve(rtn);
					 	} else {
					 		reject("Cannot find city/state pair for latlng [" + latitude + ", " + longitude + "]");
					 	}
					}, (err) => {
						reject(err);
					});
			});
	}
}
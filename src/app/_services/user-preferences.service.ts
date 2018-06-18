import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class UserPreferencesService {

	currentUser = undefined;

	constructor(protected _userService: UserService,
				protected _apiService: ApiService,
				protected _events: Events) {

		this._events.subscribe('app:login', (currentUser) => {
			this.currentUser = currentUser;
		})

	}

	setPreference(key, value) {
		if (this.currentUser) {
			let url = environment.apiUrl + "/api/user/" + this.currentUser["id"] + "/preferences/" + key;
			let data = "value=" + value;

			return new Promise((resolve, reject) => {
				this._apiService.post(url, data).subscribe(
					(val) => { resolve(val); }
				)
			});
		} else {
			console.error("setting a user specific property before the user has been set.")
		}
	}

	getPreference(key, dfault) {
		if (this.currentUser) {
			let url = environment.apiUrl + "/api/user/" + this.currentUser["id"] + "/preferences/" + key;

			return new Promise((resolve, reject) => {
				this._apiService.get(url).subscribe(
					(val) => {
						let rtn = undefined;

						if (val["_body"])
							rtn = val["body"];
						else
							rtn = dfault;

						resolve({pref: rtn}); 
					}
				)
			});
		} else {
			return undefined;
		}
	}

}
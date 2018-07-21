import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { ApiService } from './api.service';
import { environment } from '../../_environments/environment';

@Injectable()
export class UserService {
	promise = undefined;
	users = {};
	usersPromise = {};
	isCurrentUserDirty = false;
	tutorialHasBeenShown = undefined;
	currentUser = undefined;

	constructor(private _apiService: ApiService, private _events: Events) {
		this._events.subscribe('profile:changedContactInfoWasSaved', (newProfile) => { 
			let curr = this.currentUser;
			this.getUser(curr["id"], true).then((user) => {
				user["password"] = curr["password"]; // Something unsafe about that... hmmm.
				this.currentUser = user;
			});
		});

		this._events.subscribe('app:login', (currentUser) => {
			this.currentUser = currentUser;
		})

		this._events.subscribe('app:currentUserPasswordChanged', (currentUser) => {
			this.currentUser = currentUser;
		})
	}

	getUser(userId, force?: boolean) {
		let self = this;
		let rtn = undefined;

		if (self.users[userId] === undefined || force) {
			self.users[userId] = null;
			rtn = new Promise((resolve, reject) => {
				let url = environment.apiUrl + "/api/users/" + userId;			
				this._apiService.get(url).subscribe(
					(userObj) => { 
						self.users[userId] = JSON.parse(userObj["_body"]);
						resolve(self.users[userId]);
					 });
			});

			self.usersPromise[userId] = rtn;
		} else {
			rtn = self.usersPromise[userId];
		};

		return rtn;
	}

	getCurrentUser() {
		return this.currentUser;
	}

	getTutorialHasBeenShown() {
		return this.tutorialHasBeenShown;
	}

	setTutorialHasBeenShown(b) {
		this.tutorialHasBeenShown = b;
	}

	//////////////////////////
	// BEGIN DEPRECATED BLOCK - v0.0.17
		isUsernameAvailable(username) {
			return this.isUserObjectAttributeAvailable("isUsernameAvailable", username);
		}

		isEmailAddressAvailable(emailAddr) {
			return this.isUserObjectAttributeAvailable("isEmailAddressAvailable", emailAddr);
		}	

		isPhoneNumberAvailable(phone) {
			return this.isUserObjectAttributeAvailable("isPhoneNumberAvailable", phone);
		}

		isUserObjectAttributeAvailable(apiMethod, value) {
			let self = this;
			let url = environment.apiUrl + "/api/users/" + apiMethod + "?q=" + value;

			self.promise = new Promise(
				(resolve, reject) => {
					this._apiService.getUnsecuredAPI(url, '').subscribe(
						(data) => {
							resolve(JSON.parse(data["_body"]));
						}, (err) => {
							reject(err);
						})
				});

			return self.promise;
		}
	// END DEPRECATED BLOCK - v0.0.17
	////////////////////////

	isUserInformationUnique(user) {
		let self = this;
		let url = environment.apiUrl + "/api/users/isUserInformationUnique?name=" + user["name"] + "&email=" + user["email"] + "&phone=" + user["phone"];

		self.promise = new Promise(
			(resolve, reject) => {
				this._apiService.getUnsecuredAPI(url, '').subscribe(
					(data) => {
						let rtn = JSON.parse(data["_body"]);
						resolve(rtn["response"]);
					}, (err) => {
						reject(err);
					})
			});

		return self.promise;
	}

	verifyAndLoginUser(username, password) {
		let self = this;
		let url = environment.apiUrl + "/api/verifyCredentials";

		self.promise = new Promise(
			(resolve, reject) => {
				this._apiService.getWithUsernameAndPassword(url, username, password).subscribe(
					(userObj) => { 
						console.log("Credentials Valid!");
						resolve(JSON.parse(userObj["_body"]));
					 }, (err) => {
					 	reject(err);
					 });
			});

		return self.promise;
	}

	//
	// We call an api, to send a code to a phone number.
	sendCodeToPhoneNumber(phoneNumber) {
		let url = environment.apiUrl + "/api/sendSMSChallengeCodeToPhoneNumber";

		// assume phoneNumber looks like '3035551212'
		let data = "phoneNumber=" + phoneNumber;

		this._apiService.postUnsecuredAPI(url, data).subscribe(() => { 
			console.log("Just requested an SMS challenge code be sent to " + phoneNumber);
		});
	}

	isAValidSMSChallengeCode(phoneNumber, code) {
		let data = "code=" + code + "&phoneNumber=" + phoneNumber;
		let url = environment.apiUrl + "/api/isAValidSMSChallengeCode";

		return new Promise(
			(resolve, reject) => {
				this._apiService.postUnsecuredAPI(url, data).subscribe(
					(b) => { 
					 	resolve(b);
					 });
			});
	}

	save(user, code) {
		let self = this;
		let url = environment.apiUrl + "/api/users";

		let data = '';

		if (user.name && user.password) {
			data += "username="+user.name+
					"&password="+user.password;
		}

		if (user.email)
			data += "&email="+user.email;

		if (user.phone)
			data += "&phone="+user.phone;

		if (user.realname)
			data += "&realname="+user.realname;

		if (user.referringUsername) {
			data += "&referringUsername="+user.referringUsername;
		}

		if (code !== undefined) {
			data += "&newUserRegistrationCode=" + code;
		}

		self.promise = new Promise(
			(resolve, reject) => {
				this._apiService.postUnsecuredAPI(url, data).subscribe(
					(userId) => { 
						console.log("Credentials Saved! " + JSON.stringify(data));
						resolve(JSON.parse(userId["_body"]));
					 });
			});

		return self.promise;
	}

	thumbnailPromises = {};
	getThumbnailImageForUser(user) {
		let self = this;
		if (self.thumbnailPromises[user["id"]])
			return self.thumbnailPromises[user["id"]];
		else {
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/profile/picture";

			self.thumbnailPromises[user["id"]] = new Promise(
				(resolve, reject) => {
					this._apiService.get(url).subscribe(
						(base64ImageString) => {
							resolve(base64ImageString);
						});
					});

			return self.thumbnailPromises[user["id"]];
		}
	}

	setShowTutorialOnLogin(b) {
		if (this.currentUser) {
			let url = environment.apiUrl + "/api/user/" + this.currentUser["id"] + "/preferences/showTutorialOnLogin";
			let data = "value=" + (b === true);

			return new Promise((resolve, reject) => {
				this._apiService.post(url, data).subscribe(
					(val) => { resolve(val); }
				)
			});
		} else {
			console.error("setting a user specific property before the user has been set.")
		}

	}

	getShowTutorialOnLogin() {
		if (this.currentUser) {
			let url = environment.apiUrl + "/api/user/" + this.currentUser["id"] + "/preferences/showTutorialOnLogin";

			return new Promise((resolve, reject) => {
				this._apiService.get(url).subscribe(
					(val) => { resolve(val["_body"] === '' || val["_body"] === 'true' ); }
				)
			});
		} else {
			return false;
		}
	}

	changeLostPassword(smsChallengeCode, phoneNumber, newPassword) {
		
		let rtn = new Promise((resolve, reject) => {
			let self = this;
			let url = environment.apiUrl + "/api/users/changeLostPassword";

			let data = {pw: newPassword, smsChallengeCode: smsChallengeCode, phoneNumber: phoneNumber}
			let postData = this.JSON_to_URLEncoded(data, undefined, undefined);

			self._apiService.postUnsecuredAPI(url, postData).subscribe((resp) => {
					resolve(JSON.parse(resp["_body"]));
				}, (err) => {
					console.log(JSON.stringify(err)); 
					reject(err);
				});
		});

		return rtn;
	}

	changeCurrentPassword(currentPassword, newPassword) {

		let rtn = new Promise((resolve, reject) => {
			let self = this;
			let url = environment.apiUrl + "/api/users/" + this.currentUser["id"] + "/changePrevPassword";

			let data = {current_pw: currentPassword, new_pw: newPassword};
			let postData = this.JSON_to_URLEncoded(data, undefined, undefined);

			self._apiService.post(url, postData).subscribe((resp) => {
					resolve(JSON.parse(resp["_body"]));
				}, (err) => {
					console.log(JSON.stringify(err)); 
					reject(err);
				});
		});

		return rtn;

	}

	JSON_to_URLEncoded(element,key,list){
  		var list = list || [];
  		if(typeof(element)=='object'){
    		for (var idx in element)
      			this.JSON_to_URLEncoded(element[idx],key?key+'['+idx+']':idx,list);
  		} else {
    		list.push(key+'='+encodeURIComponent(element));
  		}
  		
  		return list.join('&');
	}
}
import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { UserPreferencesService } from '../../../app/_services/user-preferences.service';

@Injectable()
export class ContactInfoVisibilityService {

	contactInfoVisibilityChoices = undefined;

	contactInfoVisibilityIds = [];
	mapUserToContactInfoVisibilityId = {};

	constructor(private _userService: UserService,
				private _userPreferencesService: UserPreferencesService) {

		this.contactInfoVisibilityChoices = [
			{id: 1, text: "Email Only"},
			{id: 2, text: "Phone Only"},
			{id: 3, text: "Email and Phone"}
		];
	}

	getContactInfoVisibilityChoices() {
		return this.contactInfoVisibilityChoices;
	}

	getInitializationPromiseObject(_userId) {
		if (_userId === undefined)
			_userId = this._userService.getCurrentUser()["id"];

		if (this.mapUserToContactInfoVisibilityId[_userId] === undefined) {
			this.mapUserToContactInfoVisibilityId[_userId] = null;
			this.mapUserToContactInfoVisibilityId[_userId] = this.getPromiseWhichSetsContactInfoVisibilityId(_userId);
		}

		return this.mapUserToContactInfoVisibilityId[_userId];
	}

	getPromiseWhichSetsContactInfoVisibilityId(_userId) {
		let self = this;
		return new Promise((resolve, reject) => {
			self._userPreferencesService.getPreferenceByUserId(_userId, "contactInfoVisibilityId").then((pref) => {
				if (pref["pref"] !== undefined) {
					self.contactInfoVisibilityIds[_userId] = pref["pref"];
				} else {
					self.contactInfoVisibilityIds[_userId] = 1;
				}

				resolve(true);				
			})
		});
	}

	getContactInfoVisibilityId(_userId) {
		let self = this;

		if (_userId === undefined)
			_userId = self._userService.getCurrentUser()["id"];

		return new Promise((resolve, reject) => {
			self.getInitializationPromiseObject(_userId).then(() => {
				resolve(self.contactInfoVisibilityIds[_userId]);
			})
		});
	}

	saveContactInfoVisibilityByUserId(userId, val) {
		this.contactInfoVisibilityIds[userId] = val;
		this._userPreferencesService.setPreference("contactInfoVisibilityId", val);
	}

	isEmailAllowed(prefId) {
		return prefId === 1 || prefId === 3;
	}

	isPhoneAllowed(prefId) {
		return prefId === 2 || prefId === 3;
	}
}
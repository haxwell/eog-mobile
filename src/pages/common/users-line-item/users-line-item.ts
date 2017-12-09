import { Component, Input } from '@angular/core';
import { ModalController, NavController, NavParams, Events } from 'ionic-angular';

import { ProfilePage } from '../../profile/profile'

import { Constants } from '../../../_constants/constants'

import { ProfilePictureService } from '../../../app/_services/profile-picture.service'
import { ProfileService } from '../_services/profile.service'
import { RequestsService } from '../../../app/_services/requests.service'

@Component({
  selector: 'users-line-item',
  templateUrl: 'users-line-item.html'
})

export class UsersLineItem {

	@Input() item = undefined;
	profileImageFilepath = undefined;

	constructor(navParams: NavParams, 
				private navCtrl: NavController,
				private _profilePictureService: ProfilePictureService,
				private _profileService: ProfileService,
                _events: Events) {

	}

	ngOnInit() {

	}

	onViewProfile() {
      this.navCtrl.push(ProfilePage, { user: this.item, readOnly: true });
	}

	getProfileImageFilepath() {
		return this.profileImageFilepath;
	}

	isProfileImageAvailable() {
		let rtn = this.profileImageFilepath !== undefined && this.profileImageFilepath !== null;

		let self = this;
		if (this.profileImageFilepath === undefined) {
				this.profileImageFilepath = null;

			let path = self._profileService.getMostProbableProfilePhotoPath() + self.item["id"];
			
			self._profilePictureService.get(self.item["id"], path).then((path) => {
				if (path !== undefined)
					self.profileImageFilepath = path;
			});
		}

		return rtn; 
	}

}
import { Component, Input } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import { ProfilePage } from '../../profile/profile'

import { PictureService } from '../../../app/_services/picture.service'

import { Constants } from '../../../_constants/constants'

@Component({
  selector: 'users-line-item',
  templateUrl: 'users-line-item.html'
})

export class UsersLineItem {

	@Input() item = undefined;
	@Input() clickthru = true;
	profileImageFilepath = undefined;

	constructor(navParams: NavParams, 
				private navCtrl: NavController,
				private _pictureService: PictureService,
				private _constants : Constants,
                _events: Events) {

	}

	ngOnInit() {

	}

	onViewProfile() {
      if (this.clickthru) 
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

			self._pictureService.get(self._constants.PHOTO_TYPE_PROFILE, self.item["id"]).then((path) => {
				if (path !== undefined)
					self.profileImageFilepath = path;
			});
		}

		return rtn; 
	}

}
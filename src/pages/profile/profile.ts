import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ProfileService } from './_services/profile.service'

import { ThingPage } from '../things/things'
import { DreamPage } from '../dreams/dreams'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {

	model = {};
	dirty = true;

	constructor(public navCtrl: NavController, private _profileService: ProfileService) {

	}

	ngOnInit() {
		if (this.dirty)
			this.model = this._profileService.getModel();

		this.dirty = false;
	}

	ionViewWillEnter() {
		if (this.dirty) 
			this.ngOnInit();
	}

	onNewThingBtnTap(evt) {
		this.dirty = true;
		this.navCtrl.push(ThingPage, { thing: undefined });
	}

	onThingBtnTap(item) { 
		let self = this;
		this.navCtrl.push(ThingPage, { thing: item, callback: 
			(_params) => {
				return new Promise((resolve, reject) => {
					self.dirty = (_params === true);
					resolve();
				});
			}
 		});
	}

	onNewDreamBtnTap(evt) {
		this.dirty = true;
		this.navCtrl.push(DreamPage, { dream: undefined });
	}

	onDreamBtnTap(item) { 
		let self = this;
		this.navCtrl.push(DreamPage, { dream: item, callback: 
			(_params) => {
				return new Promise((resolve, reject) => {
					self.dirty = (_params === true);
					resolve();
				});
			}
 		});
	}

	onKeywordBtnTap(item) { 
		alert(item.text);
	}

	getAvailableIncomingRecommendations() {
		return this.model["availableIncomingRecommendations"];
	}

	getRealName(item) {
		let rtn = undefined;
		
		if (item["userInfo"]) {
			rtn = item["userInfo"]["realname"];
		}

		return rtn
	}
}

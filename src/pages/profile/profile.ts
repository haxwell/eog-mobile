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

	onNewDreamBtnTap(evt) {
		this.dirty = true;
		this.navCtrl.push(DreamPage, { dream: undefined });
	}

	onDreamBtnTap(item) { 
		alert(item.title);
	}

	onThingBtnTap(item) { 
		alert(item.title);
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

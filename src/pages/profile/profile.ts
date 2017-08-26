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

	thingAndDreamCallback = (_params) => {
		return new Promise((resolve, reject) => {
			this.dirty = (_params === true);
			resolve();
		});
	}

	onNewThingBtnTap(evt) {
		this.navCtrl.push(ThingPage, { thing: undefined, callback: this.thingAndDreamCallback });
	}

	onThingBtnTap(item) { 
		this.navCtrl.push(ThingPage, { thing: item, callback:  this.thingAndDreamCallback });
	}

	onNewDreamBtnTap(evt) {
		this.navCtrl.push(DreamPage, { dream: undefined, callback: this.thingAndDreamCallback });
	}

	onDreamBtnTap(item) { 
		this.navCtrl.push(DreamPage, { dream: item, callback: this.thingAndDreamCallback });
	}

	onKeywordBtnTap(item) { 

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

	userHasNoDreams() {
		return this.model["dreams"] === undefined || this.model["dreams"].length === 0;
	}

	userHasNoThings() {
		return this.model["things"] === undefined || this.model["things"].length === 0;
	}

	userHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}
}

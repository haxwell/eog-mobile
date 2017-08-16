import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ProfileService } from './_services/profile.service'

import { ThingPage } from '../things/things'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {

	model = {};

	constructor(public navCtrl: NavController, private _profileService: ProfileService) {

	}

	ngOnInit() {
		this.model = this._profileService.getModel();
	}

	onNewThingBtnTap(evt) {
		this.navCtrl.push(ThingPage, { thing: undefined });
	}

}

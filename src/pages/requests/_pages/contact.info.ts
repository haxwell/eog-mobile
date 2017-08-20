import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-requests-contact-info',
  templateUrl: 'contact.info.html'
})
export class RequestContactInfoPage {

	user = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController) {
		this.request = params.get('request');
		this.user = this.request["directionallyOppositeUser"];
	}

	onSaveBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

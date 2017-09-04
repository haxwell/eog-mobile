import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-requests-contact-info',
  templateUrl: 'contact.info.html'
})
export class RequestContactInfoPage {

	/** Deprecated.. The Profile Page can now be read-only **/
	/**  So Feel Free to DELETE this component one day 20170903 **/

	user = undefined;
	request = undefined;
	
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

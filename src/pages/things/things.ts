import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { RulePage } from './_pages/rule'

import { ThingService } from './_services/thing.service'

@Component({
  selector: 'page-thing-detail',
  templateUrl: 'things.html'
})

export class ThingPage {

	model = {};
	newKeywordText = '';

	constructor(public navCtrl: NavController, 
				private navParams: NavParams, 
				private modalCtrl: ModalController,
				private _thingService: ThingService) {
		this.model = navParams.get('thing');

		if (this.model === undefined)
			this.model = this._thingService.getDefaultModel();
	}

	onNewKeyword(evt) {
		this.model["keywords"].push({"text": this.newKeywordText});
		this.newKeywordText = '';
	}

	onNewRuleBtnTap(evt) {
		let modal = this.modalCtrl.create(RulePage);
		
		let self = this;
		modal.onDidDismiss(data => {
			self.model["rules"] = data; 
		})
		
		modal.present();
	}

	getRequiredUsers() {
		let rtn = undefined;

		if (this.model["rules"])
			rtn = this.model["rules"]["requiredUsers"];

		return rtn;
	}

	getRequiredPointsQuantity() {
		let rtn = 0;

		if (this.model["rules"])
			rtn = this.model["rules"]["pointsQuantity"];

		return rtn;
	}

	isSaveBtnEnabled() {
		return 	this.model["rules"] !== undefined &&
				this.model["keywords"].length > 0 &&
				this.model["title"].length > 0 &&
				this.model["description"].length > 0;
	}

	onSaveBtnTap(evt) {
		this._thingService.save(this.model).then((newThing) => {
			this.navCtrl.pop();
		})
	}

	onCancelBtnTap(evt) {
		// TODO: Check for changes before popping.
		this.navCtrl.pop();
	}
}

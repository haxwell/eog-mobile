import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { RulePage } from './_pages/rule'
import { DeleteThingPage } from './_pages/delete.thing'

import { ThingService } from './_services/thing.service'

@Component({
  selector: 'page-thing-detail',
  templateUrl: 'things.html'
})

export class ThingPage {

	model = {};
	callback = undefined;
	isNew = false;	
	newKeywordText = '';

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private modalCtrl: ModalController,
				private _thingService: ThingService) {
		this.model = navParams.get('thing');
		this.callback = navParams.get('callback');

		if (this.model === undefined) {
			this.model = this._thingService.getDefaultModel();
			this.isNew = true;
		}
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
		else
			rtn = this.model["requiredUserRecommendations"];

		return rtn;
	}

	getRequiredPointsQuantity() {
		let rtn = 0;

		if (this.model["rules"])
			rtn = this.model["rules"]["pointsQuantity"];
		else
			rtn = this.model["requiredPointsQuantity"];

		return rtn;
	}

	isNewObject() {
		return this.isNew;
	}

	isSaveBtnEnabled() {
		let rulesCondition = false;

		if (this.isNewObject)
			rulesCondition = (this.model["requiredPointsQuantity"] !== undefined && this.model["requiredPointsQuantity"] > 0);
		else
			rulesCondition = (this.model["rules"] !== undefined);

		return 	rulesCondition &&
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

	onDeleteBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(DeleteThingPage, {thing: this.model});
		modal.onDidDismiss(data => { self.callback(data).then(() => { if (data === true) self.navCtrl.pop(); }) } );
		modal.present();
	}
}

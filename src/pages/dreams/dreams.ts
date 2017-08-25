import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { DeleteDreamPage } from './_pages/delete.dream'
import { DreamService } from '../../app/_services/dream.service'

@Component({
  selector: 'page-dream-detail',
  templateUrl: 'dreams.html'
})

export class DreamPage {

	model = {};
	callback = undefined;
	isNew = false;
	newKeywordText = '';

	constructor(public navCtrl: NavController, 
				navParams: NavParams,
				private modalCtrl: ModalController,
				private _dreamService: DreamService) {
		this.model = navParams.get('dream');
		this.callback = navParams.get('callback');

		if (this.model === undefined) {
			this.model = this._dreamService.getDefaultModel();
			this.isNew = true;
		}
	}

	onNewKeyword(evt) {
		this.model["keywords"].push({"text": this.newKeywordText});
		this.newKeywordText = '';
	}

	isSaveBtnEnabled() {
		return this.model["keywords"].length > 0 &&
			this.model["title"].length > 0 &&
			this.model["description"].length > 0;
	}

	isNewObject() {
		return this.isNew;
	}

	onSaveBtnTap(evt) {
		this._dreamService.save(this.model).then((newDream) => {
			this.navCtrl.pop();
		})
	}

	onDeleteBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(DeleteDreamPage, {dream: this.model});
		modal.onDidDismiss(data => { self.callback(data).then(() => { if (data === true) self.navCtrl.pop(); }) } );
		modal.present();
	}

	onCancelBtnTap(evt) {
		// TODO: Check for changes before popping.
		this.navCtrl.pop();
	}
}

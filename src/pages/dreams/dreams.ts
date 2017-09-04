import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { DeleteDreamPage } from './_pages/delete.dream'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { DreamService } from '../../app/_services/dream.service'

@Component({
  selector: 'page-dream-detail',
  templateUrl: 'dreams.html',
})

export class DreamPage {

	model = {};
	callback = undefined;
	new = false;
	dirty = false;
	newKeywords = [];

	constructor(public navCtrl: NavController, 
				navParams: NavParams,
				private modalCtrl: ModalController,
				private _dreamService: DreamService) {
		let tmp = navParams.get('dream')
		if (tmp === undefined) {
			this.new = true;
			this.model = this._dreamService.getDefaultModel();
		} else 
		 	this.model = Object.assign({}, tmp);

		this.callback = navParams.get('callback');
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	isNewObject() {
		return this.new;
	}

	dreamHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}

	isSaveBtnEnabled() {
		return this.isDirty() && this.model["keywords"].length > 0 &&
			this.model["title"].length > 0 &&
			this.model["description"].length > 0;
	}

	onSaveBtnTap(evt) {
		let self = this;
		self.callback(this.isDirty()).then(() => {
			self._dreamService.save(self.model).then((newObj) => {
				self.navCtrl.pop();
			})
		});
	}

	onIndividualKeywordPress(item) {
		this.model["keywords"] = this.model["keywords"].filter((obj) => {
			return obj["text"] !== item["text"];
		});

		this.setDirty(true);
	}

	onAddKeywordBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(KeywordEntryPage, {keywordModel: self.newKeywords});
		modal.onDidDismiss((data: Array<Object>) => { 
			if (data) {
				data.map((obj) => { 
					self.setDirty(true); 
					self.model["keywords"].push({id: undefined, text: obj}); 
				})
			}
		});
		modal.present();
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

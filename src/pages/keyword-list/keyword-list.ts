import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { KeywordEntryPage } from '../keyword.entry/keyword.entry'

import { ProfileKeywordService } from '../../app/_services/profile-keyword.service'


@Component({
  selector: 'keyword-list',
  templateUrl: 'keyword-list.html'
})

export class KeywordListPage {

	model = undefined;
	dirty = undefined;
	newKeywordsString = '';

	constructor(private _keywordService : ProfileKeywordService,
				private modalCtrl : ModalController
	) {
		this.setDirty(true);
	}

	ngOnInit() {
		if (this.isDirty()) {
			this.model = this._keywordService.getModel();
		}
	}

	ionViewWillLeave() {
		if (this.isDirty()) {
			this._keywordService.save(this.model);
		}
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b || true;
	}

	getKeywordArray() { 
		return this.model["keywords"] || [];
	}

	userHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}

	onModifyKeywordBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(KeywordEntryPage, {keywordArray: self.model["keywords"]});
		
		modal.onDidDismiss((data: Array<Object>) => { 
			if (data) {
				self.setDirty(true);
				self.model["keywords"] = data;
				self.model["keywords"].sort((a, b) => { 
					let aText = a.text.toLowerCase(); 
					let bText = b.text.toLowerCase(); 
					if (aText > bText) return 1; 
					else if (aText < bText) return -1; 
					else return 0; 
				});
			}
		});
		
		modal.present();
	}

	isAddBtnEnabled() {
		return this.newKeywordsString.length > 0;
	}

	onAddKeywordFieldChange(evt) {
		this.newKeywordsString = evt._value;
	}

	getAddKeywordFieldValue() {
		return this.newKeywordsString;
	}

	onIndividualKeywordPress(item) {
		this.model["keywords"] = this.model["keywords"].filter((obj) => {
			return obj["text"] !== item["text"];
		});

		this.setDirty(true);
	}

	onAddBtnTap() {
		let tmp = this.newKeywordsString.split(',');

		tmp.forEach((obj) => {
			if (obj.length > 0) {
				this.setDirty(true);
				this.model["keywords"].push({id: -1, text: obj});
			}
		})

		this.newKeywordsString = '';
		this.setDirty(true);
	}
}
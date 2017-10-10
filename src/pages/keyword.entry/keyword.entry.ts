import { Component } from '@angular/core';

import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-keyword-entry',
  templateUrl: 'keyword.entry.html'
})
export class KeywordEntryPage {

	newKeywordsString: string = '';
	keywordArray = undefined;
	dirty = false;

	constructor(private viewCtrl: ViewController,
				navParams: NavParams) {
		this.keywordArray = navParams.get('keywordArray').slice();
	}

	isDirty() {
		return this.dirty === true;
	}

	setDirty(b) {
		this.dirty = b;
	}

	getKeywordArray() {
		return this.keywordArray;
	}

	userHasNoKeywords() {
		return this.keywordArray.length === 0;
	}

	isAddBtnEnabled() {
		return this.newKeywordsString.length > 0;
	}

	isSaveBtnEnabled() {
		return this.isDirty();
	}

	onAddKeywordFieldChange(evt) {
		this.newKeywordsString = evt._value;
	}

	getAddKeywordFieldValue() {
		return this.newKeywordsString;
	}

	onIndividualKeywordPress(item) {
		this.keywordArray = this.keywordArray.filter((obj) => {
			return obj["text"] !== item["text"];
		});

		this.setDirty(true);
	}

	onAddBtnTap() {
		let tmp = this.newKeywordsString.split(',');

		tmp.forEach((obj) => {
			if (obj.length > 0) {
				this.setDirty(true);
				this.keywordArray.push({id: -1, text: obj});
			}
		})

		this.newKeywordsString = '';
	}

	onSaveBtnTap(evt) {
		let tmp = this.keywordArray;
		let tmp2 = [];
		tmp.map((obj) => { 
			if (!tmp2.some((obj2) => { return obj2["text"].toLowerCase() === obj["text"].toLowerCase(); }))
				tmp2.push(obj);
		});
		this.viewCtrl.dismiss(tmp2);

		return tmp2;
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

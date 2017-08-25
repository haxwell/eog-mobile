import { Component } from '@angular/core';

import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';

@Component({
  selector: 'page-keyword-entry',
  templateUrl: 'keyword.entry.html'
})
export class KeywordEntryPage {

	keywordString: string = undefined;

	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController) {

	}

	isSaveBtnEnabled() {
		return true;
	}

	onSaveBtnTap(evt) {
		this.viewCtrl.dismiss(this.keywordString.split(','));
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

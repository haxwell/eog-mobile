import { Component } from '@angular/core';

import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-keyword-entry',
  templateUrl: 'keyword.entry.html'
})
export class KeywordEntryPage {

	keywordString: string = undefined;

	constructor(private viewCtrl: ViewController) {

	}

	isSaveBtnEnabled() {
		return this.keywordString !== undefined && this.keywordString.length > 1;
	}

	onSaveBtnTap(evt) {
		this.viewCtrl.dismiss(this.keywordString.split(','));
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

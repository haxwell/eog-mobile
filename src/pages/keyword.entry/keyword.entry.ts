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
		let tmp = this.keywordString.split(',');
		let tmp2 = [];
		tmp.map((obj) => { 
			if (!tmp2.some((obj2) => { return obj2 === obj; }))
				tmp2.push(obj);
		});
		tmp2 = tmp2.filter((obj) => { return obj != undefined && obj.length > 0 });
		this.viewCtrl.dismiss(tmp2);
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

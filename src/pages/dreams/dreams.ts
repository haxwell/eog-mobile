import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DreamService } from '../../app/_services/dream.service'

@Component({
  selector: 'page-dream-detail',
  templateUrl: 'dreams.html'
})

export class DreamPage {

	model = {};
	newKeywordText = '';

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private _dreamService: DreamService) {
		this.model = navParams.get('dream');

		if (this.model === undefined)
			this.model = this._dreamService.getDefaultModel();
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

	onSaveBtnTap(evt) {
		this._dreamService.save(this.model).then((newDream) => {
			this.navCtrl.pop();
		})
	}

	onCancelBtnTap(evt) {
		// TODO: Check for changes before popping.
		this.navCtrl.pop();
	}
}

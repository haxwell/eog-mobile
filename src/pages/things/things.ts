import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ThingService } from './_services/thing.service'

@Component({
  selector: 'page-thing-detail',
  templateUrl: 'things.html'
})

export class ThingPage {

	model = {};
	newKeywordText = '';

	constructor(public navCtrl: NavController, navParams: NavParams, private _thingService: ThingService) {
		this.model = navParams.get('thing');

		if (this.model === undefined)
			this.model = this._thingService.getDefaultModel();
	}

	ngOnInit() {
		//this.model = this._thingService.getModel();
	}

	onNewKeyword(evt) {
		this.model["keywords"].push({"text": this.newKeywordText});
		this.newKeywordText = '';
	}
}

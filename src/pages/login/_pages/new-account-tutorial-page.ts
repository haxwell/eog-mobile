import { Component } from '@angular/core';

import { ViewController, NavParams, Slides } from 'ionic-angular';

@Component({
  selector: 'page-tutorial-new-account',
  templateUrl: 'new-account-tutorial-page.html'
})
export class NewAccountTutorialPage {

	showSkip = true;
	showThisTutorialNextTime = true;
	dirty = false;

	constructor(private viewCtrl: ViewController,
				navParams: NavParams) {

	}

	showThisTutorialNextTimeChanged() {
		this.dirty = true;
	}

	continueWithLoginProcess() { 
		this.viewCtrl.dismiss();
	}

	onSlideChangeStart(slider: Slides) {
    	this.showSkip = !slider.isEnd();
  	}
}
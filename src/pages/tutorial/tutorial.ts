import { Component } from '@angular/core';

import { ViewController, NavParams, Slides } from 'ionic-angular';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {

	showSkip = true;
	currentStepNumber = 1;
	showThisTutorialNextTime = true;

	constructor(private viewCtrl: ViewController,
				navParams: NavParams) {

	}

	dismissTutorialView() { 
		this.viewCtrl.dismiss();
	}

	onSlideChangeStart(slider: Slides) {
    	this.showSkip = !slider.isEnd();
  	}
}
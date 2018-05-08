import { Component } from '@angular/core';

import { ViewController, NavParams, Slides } from 'ionic-angular';

import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {

	showSkip = true;
	currentStepNumber = 1;
	showThisTutorialNextTime = true;
	dirty = false;

	constructor(private viewCtrl: ViewController,
				private _userService: UserService,
				navParams: NavParams) {

	}

	showThisTutorialNextTimeChanged() {
		this.dirty = true;
	}

	startApp() { 
		if (this.dirty)
			this._userService.setShowTutorialOnLogin(this.showThisTutorialNextTime);

		this.viewCtrl.dismiss();
	}

	onSlideChangeStart(slider: Slides) {
    	this.showSkip = !slider.isEnd();
  	}
}
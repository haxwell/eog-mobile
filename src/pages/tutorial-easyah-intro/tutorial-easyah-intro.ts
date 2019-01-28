import { Component } from '@angular/core';

import { ViewController, NavParams, Slides } from 'ionic-angular';

import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-tutorial-easyah-intro',
  templateUrl: 'tutorial-easyah-intro.html'
})
export class TutorialEasyahIntroPage {

	showSkip = true;
	currentStepNumber = 1;
	showThisTutorialNextTime = true;
	dirty = false;

	constructor(private viewCtrl: ViewController,
				private _userService: UserService,
				navParams: NavParams) {

	}

	ngOnInit() {
		let self = this;
		self._userService.getShowTutorialOnLogin().then((val: boolean) => {
			self.showThisTutorialNextTime = val;
		})
	}

	showThisTutorialNextTimeChanged() {
		this.dirty = true;
	}

	dismissTutorialView() { 
		if (this.dirty)
			this._userService.setShowTutorialOnLogin(this.showThisTutorialNextTime);

		this.viewCtrl.dismiss();
	}

	onSlideChangeStart(slider: Slides) {
    	this.showSkip = !slider.isEnd();
  	}
}
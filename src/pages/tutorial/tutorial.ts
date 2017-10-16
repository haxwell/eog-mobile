import { Component } from '@angular/core';

import { ViewController, NavParams } from 'ionic-angular';

import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {

	currentStepNumber = 1;

	constructor(private viewCtrl: ViewController,
				private _userService: UserService,
				navParams: NavParams) {

	}

	onNextBtnTap() {
		this.currentStepNumber++;
	}

	onExitBtnTap() {
		this.viewCtrl.dismiss();
	}

	onDoNotShowAgainBtnTap() {
		this._userService.setShowTutorialOnLogin(false);
		this.viewCtrl.dismiss();
	}

	isCurrentStep(n) {
		return this.currentStepNumber === n;
	}

	getCurrentStep() {
		return this.currentStepNumber;
	}
}
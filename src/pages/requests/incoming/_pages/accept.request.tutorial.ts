import { Component } from '@angular/core';

import { ViewController, NavParams, Slides } from 'ionic-angular';

import { UserPreferencesService } 	from '../../../../app/_services/user-preferences.service';

@Component({
  selector: 'page-tutorial-accept-request',
  templateUrl: 'accept.request.tutorial.html'
})
export class AcceptRequestTutorialPage {

	showSkip = true;
	showThisTutorialNextTime = true;
	dirty = false;

	constructor(private viewCtrl: ViewController,
				private _userPreferencesService: UserPreferencesService,
				navParams: NavParams) {

	}

	showThisTutorialNextTimeChanged() {
		this.dirty = true;
	}

	dismissTutorial() { 
		if (this.dirty)
			this._userPreferencesService.setPreference("showTutorialAfterRequestAccepted", this.showThisTutorialNextTime);

		this.viewCtrl.dismiss();
	}

	onSlideChangeStart(slider: Slides) {
    	this.showSkip = !slider.isEnd();
  	}
}
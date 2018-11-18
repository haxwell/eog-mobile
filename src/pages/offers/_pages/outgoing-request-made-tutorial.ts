import { Component } from '@angular/core';

import { ViewController, NavParams, Slides } from 'ionic-angular';

import { UserPreferencesService } 	from '../../../app/_services/user-preferences.service';

@Component({
  selector: 'page-tutorial-outgoing-request-made',
  templateUrl: 'outgoing-request-made-tutorial.html'
})
export class OutgoingRequestMadeTutorialPage {

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
			this._userPreferencesService.setPreference("showTutorialAfterOutgoingRequestMade", this.showThisTutorialNextTime);

		this.viewCtrl.dismiss();
	}

	onSlideChangeStart(slider: Slides) {
    	this.showSkip = !slider.isEnd();
  	}
}
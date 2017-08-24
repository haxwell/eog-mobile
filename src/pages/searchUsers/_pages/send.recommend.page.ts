import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RecommendationService } 	from '../../../app/_services/recommendation.service';

@Component({
  selector: 'page-search-users-send-recommend',
  templateUrl: 'send.recommend.page.html'
})
export class SendRecommendPage {
	
	user = undefined;

	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController,
				private _recommendationService: RecommendationService) {

		this.user = params.get('user');
	}

	onSaveBtnTap(evt) {
		this._recommendationService.sendARecommendationToAUser(this.user["id"]).then(() => {
			this.viewCtrl.dismiss();
		});
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

import { Component } from '@angular/core';

import { NavController, NavParams, ViewController, LoadingController } from 'ionic-angular';

import { RecommendationService } 	from '../../../app/_services/recommendation.service';

@Component({
  selector: 'page-search-users-send-recommend',
  templateUrl: 'send.recommend.page.html'
})
export class SendRecommendPage {
	
	user = undefined;
	loading = undefined;

	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController,
				private _recommendationService: RecommendationService,
				private loadingCtrl: LoadingController) {

		this.user = params.get('user');
	}

	onSaveBtnTap(evt) {
		let self = this;
		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();

		this._recommendationService.sendARecommendationToAUser(this.user["id"]).then(() => {
			self.loading.dismiss();
			self.viewCtrl.dismiss();
		});
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

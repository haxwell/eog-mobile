import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { PointsService } 	from '../../../app/_services/points.service';

@Component({
  selector: 'page-search-users-send-point',
  templateUrl: 'send.point.page.html'
})
export class SendPointPage {
	
	user = undefined;

	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController,
				private _pointsService: PointsService) {

		this.user = params.get('user');
	}

	onSaveBtnTap(evt) {
		this._pointsService.sendAPointToAUser(this.user["id"]).then(() => {
			this.viewCtrl.dismiss();
		});
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

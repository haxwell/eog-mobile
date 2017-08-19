import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';

@Component({
  selector: 'page-requests-incoming-accept',
  templateUrl: 'accept.request.html'
})
export class AcceptRequestPage {

	request = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService) {
		this.request = params.get('request');
	}

	onSaveBtnTap(evt) {
		this._requestsService.acceptRequest(this.request).then((obj) => {
			console.log(obj);
			this.viewCtrl.dismiss();			
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

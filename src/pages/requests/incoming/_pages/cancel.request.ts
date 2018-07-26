import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';

@Component({
  selector: 'page-requests-incoming-cancel',
  templateUrl: 'cancel.request.html'
})

export class CancelRequestPage {

	confirmationString = '';
	request = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService) {
		this.request = params.get('request');
	}

	isSaveBtnEnabled() {
		return this.confirmationString.toLowerCase() === 'cancel';
	}

	onSaveBtnTap(evt) {
		if (this.isSaveBtnEnabled()) {
			this._requestsService.cancelIncomingRequest(this.request).then((obj) => {
				this.viewCtrl.dismiss(obj);
			})
		}
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

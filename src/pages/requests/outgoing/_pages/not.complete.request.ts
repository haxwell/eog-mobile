import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';

@Component({
  selector: 'page-requests-outgoing-not-complete',
  templateUrl: 'not.complete.request.html'
})

export class NotCompleteOutgoingRequestPage {

	confirmationString = undefined;
	request = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService) {
		this.request = params.get('request');
	}

	isSaveBtnEnabled() {
		return this.confirmationString && this.confirmationString.toLowerCase() === 'incomplete';
	}

	onSaveBtnTap(evt) {
		if (this.isSaveBtnEnabled()) {
			this._requestsService.notCompleteOutgoingRequest(this.request).then((obj) => {
				console.log(obj);
				this.viewCtrl.dismiss();
			});
		}
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

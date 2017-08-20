import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';

@Component({
  selector: 'page-requests-outgoing-cancel',
  templateUrl: 'cancel.request.html'
})

export class CancelOutgoingRequestPage {

	REQUEST_STATUS_ACCEPTED = 3;

	confirmationString = '';
	request = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService) {
		this.request = params.get('request');
	}

	isSaveBtnEnabled() {
		return !this.isRequestAccepted() || (this.isRequestAccepted() && this.confirmationString.toLowerCase() === 'cancel');
	}

	isRequestAccepted() {
		return this.request.deliveringStatusId === this.REQUEST_STATUS_ACCEPTED;
	}

	onSaveBtnTap(evt) {
		this._requestsService.cancelOutgoingRequest(this.request).then((obj) => {
			console.log(obj);
			this.viewCtrl.dismiss();			
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

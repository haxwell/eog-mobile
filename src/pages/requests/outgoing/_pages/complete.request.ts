import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';

import { Constants } from '../../../../_constants/constants';

@Component({
  selector: 'page-requests-outgoing-complete',
  templateUrl: 'complete.request.html'
})

export class CompleteOutgoingRequestPage {

	request = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService,
				private _constants: Constants) {
		this.request = params.get('request');
	}

	isRequestInDispute() {
		return this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && 
				this.request["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED;
	}

	onSaveBtnTap(evt) {
		this._requestsService.completeOutgoingRequest(this.request).then((obj) => {
			this.viewCtrl.dismiss();
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

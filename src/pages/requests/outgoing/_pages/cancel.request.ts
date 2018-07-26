import { Component } from '@angular/core';

import { NavController, NavParams, ViewController, Events } from 'ionic-angular';

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
				private _requestsService: RequestsService,
				private _events : Events) {
		this.request = params.get('request');
	}

	isSaveBtnEnabled() {
		return !this.isRequestAccepted() || (this.isRequestAccepted() && this.confirmationString.toLowerCase() === 'cancel');
	}

	isRequestAccepted() {
		return this.request.deliveringStatusId === this.REQUEST_STATUS_ACCEPTED;
	}

	onSaveBtnTap(evt) {
		let self = this;
		self._requestsService.cancelOutgoingRequest(this.request).then((data) => {
			
			// in the case of an outgoing request being cancelled, if it is not accepted by the delivering side, 
			//  then no object is returned from the server, so data == undefined

			self._events.publish("request:outgoing:cancelled", {request: data});
			self.viewCtrl.dismiss(true);
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss(false);
	}
}

import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';

@Component({
  selector: 'page-requests-incoming-complete',
  templateUrl: 'second.complete.request.html'
})

export class SecondCompleteRequestPage {

	confirmationString = '';
	request = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService) {
		this.request = params.get('request');
	}

	isSaveBtnEnabled() {
		return this.confirmationString.toLowerCase() === 'complete';
	}

	onSaveBtnTap(evt) {
		this._requestsService.secondCompleteIncomingRequest(this.request).then((obj) => {
			console.log(obj);
			this.viewCtrl.dismiss();			
		});
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';
import { ApiService } 	from '../../../../app/_services/api.service';
import { environment } from '../../../../_environments/environment';

import { Constants } from '../../../../_constants/constants';

@Component({
  selector: 'page-requests-incoming-complete',
  templateUrl: 'complete.request.html'
})

export class CompleteRequestPage {

	confirmationString = '';
	request = undefined;
	requestAgainDelayCodes = undefined;
	selectedRequestAgainDelayId = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService,
				private _apiService: ApiService,
				private _constants : Constants) {
		this.request = params.get('request');
	}

	ngOnInit() {
		let self = this;
		let url = environment.apiUrl + "/api/requestAgainDelayCodes";
		this._apiService.get(url).subscribe((data) => {
			self.requestAgainDelayCodes = JSON.parse(data["_body"]);
			self.selectedRequestAgainDelayId = self.requestAgainDelayCodes.find((obj) => { return obj["milliseconds"] === 1;})["id"];
		})
	}

	isSaveBtnEnabled() {
		return this.confirmationString.toLowerCase() === 'complete';
	}

	isRequestInDispute() {
		return this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED;
	}

	getSelectedRequestAgainDelayId() {
		return this.selectedRequestAgainDelayId;
	}

	onSaveBtnTap(evt) {
		this.request["requestAgainDelayCode"] = this.getSelectedRequestAgainDelayId(); 
		this._requestsService.completeIncomingRequest(this.request).then((obj) => {
			console.log(obj);
			this.viewCtrl.dismiss();			
		});
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

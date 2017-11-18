import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { environment } from '../../../../_environments/environment';

import { RequestsService } 	from '../../../../app/_services/requests.service';
import { ApiService } 	from '../../../../app/_services/api.service';

@Component({
  selector: 'page-requests-incoming-decline',
  templateUrl: 'decline.request.html'
})
export class DeclineRequestPage {
	
	request = undefined;
	declineReasonCodes = undefined;
	selectedDeclineReasonId = undefined;
	requestAgainDelayCodes = undefined;
	selectedRequestAgainDelayId = undefined;

	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService,
				private _apiService: ApiService) {
		this.request = params.get('request');
	}

	ngOnInit() {
		let self = this;
		let url = environment.apiUrl + "/api/declineReasonCodes";
		this._apiService.get(url).subscribe((data) => {
			self.declineReasonCodes = JSON.parse(data["_body"]);
		});

		url = environment.apiUrl + "/api/requestAgainDelayCodes";
		this._apiService.get(url).subscribe((data) => {
			self.requestAgainDelayCodes = JSON.parse(data["_body"]);
			self.selectedRequestAgainDelayId = self.requestAgainDelayCodes.find((obj) => { return obj["milliseconds"] === 1;})["id"];
		})
	}

	isSaveBtnAvailable() {
		return this.selectedDeclineReasonId !== undefined && this.selectedRequestAgainDelayId !== undefined;
	}

	onSaveBtnTap(evt) {
		this.request["declinedReasonCode"] = this.selectedDeclineReasonId;
		this.request["requestAgainDelayCode"] = this.selectedRequestAgainDelayId;
		this._requestsService.declineIncomingRequest(this.request).then((obj) => {
			console.log(obj);
			this.viewCtrl.dismiss();
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

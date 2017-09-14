import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { PrmService } 	from '../_services/prm.service';
import { RequestsService } 	from '../../../app/_services/requests.service';

@Component({
  selector: 'page-prm-detail-delete',
  templateUrl: 'delete.prm.html'
})
export class DeletePrmPage {

	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_COMPLETED = 4;
	REQUEST_STATUS_CANCELLED = 5;	
	REQUEST_STATUS_NOT_COMPLETED = 6;		

	prm = undefined;
	prmRequests = undefined;
	prmRequestsInProgress = undefined;
	prmRequestsNotInProgress = undefined;
	isInitialized = false;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _prmService: PrmService,
				private _requestsService: RequestsService) {
		this.prm = params.get('prm');
	}

	ngOnInit() {
		let self = this;

		this._requestsService.getModelForIncoming().then((model: Array<Object>) => {
			// get all the requests for this prm
			self.prmRequests = model.filter((obj) => {
				return obj["prm"]["id"] === self.prm["id"]; });

			// create another list with all the requests for this prm that are in progress
			self.prmRequestsInProgress = self.prmRequests.filter((obj) => { 
				return obj["deliveringStatusId"] === self.REQUEST_STATUS_ACCEPTED; });

			// a third list for all the requests for this prm that are not in progress
			self.prmRequestsNotInProgress = self.prmRequests.filter((obj) => {
				return self.prmRequestsInProgress.some((obj2) => { return obj2["id"] !== obj["id"]; }); 
			});

			self.isInitialized = true;
		});
	}

	getPrmRequestsNotInProgress() {
		return this.prmRequestsNotInProgress;
	}

	getPrmRequestsInProgress() {
		return this.prmRequestsInProgress;
	}

	isPrmAttachedToARequestNotInProgress() {
		return this.prmRequestsNotInProgress && this.prmRequestsNotInProgress.length > 0;
	}

	isPrmAttachedToAnInProgressRequest() {
		return this.prmRequestsInProgress && this.prmRequestsInProgress.length > 0;
	}

	isDeleteBtnEnabled() {
		return this.isInitialized && !this.isPrmAttachedToAnInProgressRequest();
	}

	onDeleteBtnTap(evt) {
		this._prmService.delete(this.prm).then(() => {
			this.viewCtrl.dismiss(true);
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

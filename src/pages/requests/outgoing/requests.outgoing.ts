import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'

import { NotCompleteOutgoingRequestPage } from './_pages/not.complete.request'
import { CompleteOutgoingRequestPage } from './_pages/complete.request'
import { CancelOutgoingRequestPage } from './_pages/cancel.request'
import { RequestContactInfoPage } from '../_pages/contact.info'

import { Constants } from '../../../_constants/constants'

@Component({
  selector: 'page-requests-outgoing',
  templateUrl: 'requests.outgoing.html'
})

export class RequestsOutgoingPage {

	model = undefined;
	
	constructor(public navCtrl: NavController,
				private modalCtrl: ModalController,
				private _requestsService: RequestsService,
				private _constants: Constants) { 

	}

	getAcceptedRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_ACCEPTED);
	}

	getCancelledRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_CANCELLED);
	}

	getDeclinedRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_DECLINED);
	}

	getPendingRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_PENDING);
	}

	getCompletedAwaitingApprovalRequests() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_COMPLETED; });
			return rtn.length > 0 ? rtn : undefined			
		}

		return undefined;
	}

	getNotCompleteAwaitingResolution() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] === self._constants.REQUEST_STATUS_NOT_COMPLETED; });
			return rtn.length > 0 ? rtn : undefined			
		}

		return undefined;
	}

	filterModelByDeliveringStatus(status) {
		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === status; });
			return rtn.length > 0 ? rtn : undefined
		}
		else
			return undefined;
	}

	ngOnInit() {
		var self = this;
		this._requestsService.getModelForOutgoing().then((data) => {
			self.model = data;
		});
	}

	onCompleteBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(CompleteOutgoingRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onNotCompleteBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(NotCompleteOutgoingRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCancelBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(CancelOutgoingRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onViewContactInfoBtnTap(item) {
		let modal = this.modalCtrl.create(RequestContactInfoPage, {user: item["directionallyOppositeUser"]});
		modal.onDidDismiss(data => {  });
		modal.present();
	}
}

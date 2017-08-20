import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'

import { AcceptOutgoingRequestPage } from './_pages/accept.request'
import { CancelOutgoingRequestPage } from './_pages/cancel.request'
//import { RequestContactInfoPage } from '../_pages/contact.info'

@Component({
  selector: 'page-requests-outgoing',
  templateUrl: 'requests.outgoing.html'
})

export class RequestsOutgoingPage {

	// TODO: Put these in a constants object and share it.. 
	REQUEST_STATUS_PENDING = 1;
	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_CANCELLED = 5;

	model = undefined;
	
	constructor(public navCtrl: NavController,
				private modalCtrl: ModalController,
				private _requestsService: RequestsService) {

	}

	getAcceptedRequests() {
		return this.filterModelByRequestStatus(this.REQUEST_STATUS_ACCEPTED);
	}

	getCancelledRequests() {
		return this.filterModelByRequestStatus(this.REQUEST_STATUS_CANCELLED);
	}

	getDeclinedRequests() {
		return this.filterModelByRequestStatus(this.REQUEST_STATUS_DECLINED);
	}

	getPendingRequests() {
		return this.filterModelByRequestStatus(this.REQUEST_STATUS_PENDING);
	}

	filterModelByRequestStatus(status) {
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

	onAcceptBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(AcceptOutgoingRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCancelBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(CancelOutgoingRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

//	onViewContactInfoBtnTap(item) {
//		let modal = this.modalCtrl.create(RequestContactInfoPage, {user: item["directionallyOppositeUser"]});
//		modal.onDidDismiss(data => {  });
//		modal.present();
//	}
}

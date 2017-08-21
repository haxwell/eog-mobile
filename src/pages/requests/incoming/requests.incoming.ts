import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { AcceptRequestPage } from './_pages/accept.request'
import { DeclineRequestPage } from './_pages/decline.request'
import { CompleteRequestPage } from './_pages/complete.request'
import { SecondCompleteRequestPage } from './_pages/second.complete.request'
import { CancelRequestPage } from './_pages/cancel.request'
import { RequestContactInfoPage } from '../_pages/contact.info'

import { RequestsService } from '../../../app/_services/requests.service'

@Component({
  selector: 'page-requests-incoming',
  templateUrl: 'requests.incoming.html'
})

export class RequestsIncomingPage {

	// TODO: Put these in a constants object and share it.. 
	REQUEST_STATUS_PENDING = 1;
	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_COMPLETED = 4;
	REQUEST_STATUS_CANCELLED = 5;
	REQUEST_STATUS_NOT_COMPLETED = 6;

	model = undefined;
	dirty = false;
	theOtherUser = undefined;
	
	constructor(public navCtrl: NavController,
				private modalCtrl: ModalController,
				private _requestsService: RequestsService) {

	}

	ngOnInit() {
		var self = this;
		this._requestsService.getModelForIncoming().then((data) => {
			self.model = data;
			this.dirty = false;
		});
	}

	getAcceptedRequests() {
		return this.filterModelByDeliveringStatus(this.REQUEST_STATUS_ACCEPTED);
	}

	getDeclinedRequests() {
		return this.filterModelByDeliveringStatus(this.REQUEST_STATUS_DECLINED);
	}

	getPendingRequests() {
		return this.filterModelByDeliveringStatus(this.REQUEST_STATUS_PENDING);
	}

	getCompletedPendingApprovalRequests() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self.REQUEST_STATUS_NOT_COMPLETED; });
			return rtn.length > 0 ? rtn : undefined			
		}

		return undefined;
	}

	getDisputedCompletedRequests() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] === self.REQUEST_STATUS_NOT_COMPLETED; });
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

	onDeclineBtnTap(item) {
		this.dirty = true;
		let self = this;
		let modal = this.modalCtrl.create(DeclineRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onAcceptBtnTap(item) {
		this.dirty = true;
		let self = this;
		let modal = this.modalCtrl.create(AcceptRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCompleteBtnTap(item) {
		this.dirty = true;
		let self = this;
		let modal = this.modalCtrl.create(CompleteRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onSecondCompleteBtnTap(item) {
		this.dirty = true;
		let self = this;
		let modal = this.modalCtrl.create(SecondCompleteRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onUnableToCompleteBtnTap(item) {
		this.dirty = true;
		let self = this;
		let modal = this.modalCtrl.create(CancelRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onViewContactInfoBtnTap(item) {
		let modal = this.modalCtrl.create(RequestContactInfoPage, {request: item});
		modal.onDidDismiss(data => {  });
		modal.present();
	}
}

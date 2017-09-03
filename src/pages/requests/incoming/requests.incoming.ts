import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { AcceptRequestPage } from './_pages/accept.request'
import { DeclineRequestPage } from './_pages/decline.request'
import { CompleteRequestPage } from './_pages/complete.request'
import { SecondCompleteRequestPage } from './_pages/second.complete.request'
import { CancelRequestPage } from './_pages/cancel.request'
import { RequestContactInfoPage } from '../_pages/contact.info'

import { RequestsService } from '../../../app/_services/requests.service'

import { Constants } from '../../../_constants/constants'

@Component({
  selector: 'page-requests-incoming',
  templateUrl: 'requests.incoming.html'
})

export class RequestsIncomingPage {

	model = undefined;
	dirty = false;
	theOtherUser = undefined;
	
	constructor(public navCtrl: NavController,
				private modalCtrl: ModalController,
				private _requestsService: RequestsService,
				private _constants: Constants,
				private _events: Events) {
		
		let func = (data) => {
			this.replaceModelElement(data["request"]);
		};

		_events.subscribe('request:received', func);
		_events.subscribe('request:cancelled', func);
		_events.subscribe('request:completedAndApproved', func);
		_events.subscribe('request:isInDispute', func);
	}

	replaceModelElement(request) {
		let temp = this.model.filter((obj) => { return obj["id"] !== request["id"]; });
		temp.push(request);
		this.model = temp;
	}

	ngOnInit() {
		var self = this;
		this._requestsService.getModelForIncoming().then((data) => {
			self.model = data;
			this.dirty = false;
		});
	}

	isRequestModelEmpty() {
		return this.model == undefined || this.model.length === 0;
	}

	getAcceptedRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_ACCEPTED);
	}

	getDeclinedRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_DECLINED);
	}

	getPendingRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_PENDING);
	}

	getCompletedPendingApprovalRequests() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_COMPLETED; });
			return rtn.length > 0 ? rtn : undefined			
		}

		return undefined;
	}

	getDisputedCompletedRequests() {
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

import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { AcceptRequestPage } from './_pages/accept.request'
import { DeclineRequestPage } from './_pages/decline.request'
import { CompleteRequestPage } from './_pages/complete.request'
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
		return this.filterModelByRequestStatus(this.REQUEST_STATUS_ACCEPTED);
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

	onCompletedBtnTap(item) {
		this.dirty = true;
		let self = this;
		let modal = this.modalCtrl.create(CompleteRequestPage, {request: item});
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
		let modal = this.modalCtrl.create(RequestContactInfoPage, {user: item["directionallyOppositeUser"]});
		modal.onDidDismiss(data => {  });
		modal.present();
	}
}

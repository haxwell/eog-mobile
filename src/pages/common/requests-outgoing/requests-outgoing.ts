import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { NotCompleteOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/not.complete.request'
import { CompleteOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/complete.request'
import { CancelOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/cancel.request'
import { ProfilePage } from '../../../pages/profile/profile'

import { RequestsService } from '../../../app/_services/requests.service'

import { Constants } from '../../../_constants/constants'

@Component({
  selector: 'requests-outgoing-view',
  templateUrl: 'requests-outgoing.html'
})

export class RequestsOutgoingView {

	model = undefined;
	
	constructor(public navCtrl: NavController,
				private modalCtrl: ModalController,
				private _requestsService: RequestsService,
				private _constants: Constants,
				_events: Events) { 
		let func = (data) => {
			this.replaceModelElement(data["request"]);
		};

		_events.subscribe('request:saved', func);
		_events.subscribe('request:accepted', func);
		_events.subscribe('request:declined', func);
		_events.subscribe('request:completed', func);
		_events.subscribe('request:deleted', func);
	}

	replaceModelElement(request) {
		let temp = this.model.filter((obj) => { return obj["id"] !== request["id"]; });
		temp.push(request);
		this.model = temp;
	}

	ngOnInit() {
		var self = this;
		this._requestsService.getOutgoingRequestsForCurrentUser().then((data: Array<Object>) => {
				self.model = data;
			});
	}

	isRequestModelEmpty() {
		let rtn = this.model === undefined || this.model.length === 0;

		let len = 0;
		if (!rtn) {
			len = this.model.length;
			len -= this.getNumberOfMatchingElements((obj) => { 
					return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_COMPLETED;
				});

			rtn = len <= 0;
		}

		return rtn;
	}

	getNumberOfMatchingElements(func) {
		if (this.model === undefined)
			return 0;

		let count = 0;
		this.model.map((obj) => { if (func(obj)) count++; });

		return count;
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
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self._constants.REQUEST_STATUS_COMPLETED && (obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_NOT_COMPLETED); });
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

	onAcknowledgeBtnTap(item) {
		let self = this;
		self._requestsService.acknowledgeDeclinedRequest(item).then((data) => {
			let list = self.model.filter((obj) => { return obj["id"] !== item["id"]; });
			self.model = list;
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
		let modal = this.modalCtrl.create(ProfilePage, {user: item["directionallyOppositeUser"], readOnly: true});
		modal.onDidDismiss(data => {  });
		modal.present();
	}
}
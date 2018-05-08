import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'

import { Constants } from '../../../_constants/constants'

/* TODO: Move Promises to the Common area. Since it is called from this common component. */
import { PrmDisplayPage } from '../../promises/display.prm'

import { PermanentlyDismissUnresolvedRequestPage } from '../../../pages/requests/outgoing/_pages/permanently-dismiss-unresolved-request'
import { NotCompleteOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/not.complete.request'
import { CompleteOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/complete.request'
import { CancelOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/cancel.request'
import { ProfilePage } from '../../../pages/profile/profile'

import { CompleteRequestPage } from '../../../pages/requests/incoming/_pages/complete.request'

@Component({
  selector: 'requests-outgoing-view',
  templateUrl: 'requests-outgoing.html'
})

export class RequestsOutgoingView {

	model = undefined;
	loading = undefined;

	constructor(public navCtrl: NavController,
				private loadingCtrl: LoadingController,
				private modalCtrl: ModalController,
				private _requestsService: RequestsService,
				private _constants: Constants,
				_events: Events) { 

		let func = (req) => {
			this._requestsService.getOutgoingRequestsForCurrentUser().then((data: Array<Object>) => {
				this.model = data;
			});
		};

		_events.subscribe('request:saved', func);
		_events.subscribe('request:accepted', func);
		_events.subscribe('request:completed', func);
		_events.subscribe('request:cancelled', func);
		_events.subscribe('request:declined', func);
		_events.subscribe('request:deleted', func);
	}

	getTrack(request) {
		if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_PENDING)
			return "pending";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED)
			return "declined";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED_AND_HIDDEN)
			return "declinedAndHidden";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_ACCEPTED)
			return "accepted";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED)
			return "completed";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED)
			return "cancelled";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED)
			return "notCompleted";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_RESOLVED_BUT_DISPUTED)
			return "resolvedButDisputed";
			
			// TODO: these bits of code comparing delivering and requesting status to determine a state
			// TODO:  are used in multple places.. refactor them into one.
		
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && (request["requestingStatusId"] !== this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] !== this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED && request["requestingStatusId"] !== this._constants.REQUEST_STATUS_NOT_COMPLETED))
			return "completedAwaitingApproval";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED)
			return "notCompletedAwaitingResolution";
	}

	getDirection() { return "outgoing"; }

	replaceModelElement(request) {
		let temp = this.model.filter((obj) => { return obj["id"] !== request["id"]; });
		temp.push(request);
		this.model = temp;
	}

	ngOnInit() {
		var self = this;

		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		});

		self.loading.present();

		this._requestsService.getOutgoingRequestsForCurrentUser().then((data: Array<Object>) => {
				self.model = data;
				self.loading.dismiss();
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
			len -= this.getNumberOfMatchingElements((obj) => { 
					return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_COMPLETED;
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
		// TODO: Refactor filterModelByDeliveringStatus() to take multiple statuses.

		if (this.model) {
			let rtn = this.model.filter(
				(obj) => { 
					return 	obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED || 
							obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED_AND_HIDDEN;
				}
			);
			return ((rtn.length > 0) ? rtn : undefined);
		}
		else
			return undefined;
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

	getPrmAvatarImageFilepath() {
		return undefined;
	}

	isPrmAvatarImageAvailable() {
		return false; 
	}

	hasRequestMessage(req) {
		return (req["requestMessage"] !== undefined && req["requestMessage"] !== null);
	}

	getRequestMessage(req) {
		return req["requestMessage"];
	}

	onViewContactInfoBtnTap(request) {
		this.navCtrl.push(ProfilePage, { user: request["directionallyOppositeUser"], readOnly: true });
	}

	onViewPromise(request) {
		this.navCtrl.push(PrmDisplayPage, { prm: request.prm });
	}

	onPermanentlyDismissBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(PermanentlyDismissUnresolvedRequestPage, {request: request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCompleteBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(CompleteRequestPage, {request: request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCompleteOutgoingBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(CompleteOutgoingRequestPage, {request: request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onNotCompleteBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(NotCompleteOutgoingRequestPage, {request: request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCancelBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(CancelOutgoingRequestPage, {request: request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onAcknowledgeDeclinedRequestBtnTap(request) {
		let self = this;
		self._requestsService.acknowledgeDeclinedRequest(request).then((data) => {
			self.ngOnInit();
		});
	}

	onAcknowledgeCancelledRequestBtnTap(request) {
		let self = this;
		self._requestsService.acknowledgeCancelledRequest(request).then((data) => {
			//self.ngOnInit();
		});
	}

}
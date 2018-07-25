import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'
import { PictureService } from '../../../app/_services/picture.service'

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
				private _pictureService: PictureService,
				private _constants: Constants,
				private _events: Events) { 

		let func = (data) => {
			this.replaceModelElement(data["request"]);
		};

		this._events.subscribe('request:saved', func);
		this._events.subscribe('request:accepted', func);
		this._events.subscribe('request:completed', func);
		this._events.subscribe('request:cancelled', func);
		this._events.subscribe('request:declined', func);
		this._events.subscribe('request:deleted', func);
		this._events.subscribe('request:inamicablyResolved', func);
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
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED) {
			if ((request["requestingStatusId"] !== this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] !== this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED && request["requestingStatusId"] !== this._constants.REQUEST_STATUS_NOT_COMPLETED))
				return "completedAwaitingApproval";
			else if (request["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED)
				return "notCompleteAwaitingResolution"
			else
				return "completed";
		}
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED)
			return "cancelled";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED)
			return "notCompleted";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_RESOLVED_BUT_DISPUTED)
			return "resolvedButDisputed";
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

	getThumbnailImage(prm) {
		if (prm["imageFileURI"] !== undefined && prm["imageOrientation"] !== undefined)
			return prm["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	getAvatarCSSClassString(prm) {
		return this._pictureService.getOrientationCSS(prm);
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

	onCompleteOutgoingBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(CompleteOutgoingRequestPage, {request: request});
		modal.onDidDismiss(data => { self.ngOnInit(); self._events.publish('request:markedApprovedAfterCompletion'); });
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
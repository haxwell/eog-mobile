import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'
import { PictureService } from '../../../app/_services/picture.service'

import { Constants } from '../../../_constants/constants'

/* TODO: Move Offers to the Common area. Since it is called from this common component. */
import { OfferDisplayPage } from '../../offers/display.offer'

import { AcceptRequestPage } from '../../../pages/requests/incoming/_pages/accept.request'
import { DeclineRequestPage } from '../../../pages/requests/incoming/_pages/decline.request'
import { CompleteRequestPage } from '../../../pages/requests/incoming/_pages/complete.request'
import { CancelRequestPage } from '../../../pages/requests/incoming/_pages/cancel.request'
import { ProfilePage } from '../../../pages/profile/profile'

@Component({
  selector: 'requests-incoming-view',
  templateUrl: 'requests-incoming.html'
})

export class RequestsIncomingView {

	model = undefined;
	loading = undefined;
	dirty = false;
	theOtherUser = undefined;
	
	constructor(public navCtrl: NavController,
				private modalCtrl: ModalController,
				private loadingCtrl: LoadingController,
				private _requestsService: RequestsService,
				private _pictureService: PictureService,
				private _constants: Constants,
				_events: Events) {
		
		let func = (data) => {
			this.replaceModelElement(data["request"]);
		};

		_events.subscribe('request:received', func);
		_events.subscribe('request:incoming:cancelled', func);
		_events.subscribe('request:notYetAccepted:cancelledByRequestor', func);
		_events.subscribe('request:accepted:cancelledByRequestor', func);
		_events.subscribe('request:completedAndApproved', func);
		_events.subscribe('request:isInDispute', func);
		_events.subscribe('request:inamicablyResolved', func);
		_events.subscribe('request:declined:acknowledged', func);
		_events.subscribe('request:cancelled:acknowledged', func);

		_events.subscribe('offer:deletedByCurrentUser', () => { 
			this.ngOnInit();
		});
	}

	getTrack(request) {
		if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_PENDING)
			return "pending";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED)
			return "declined";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_ACCEPTED)
			return "accepted";
		else if (request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED) {
			if ((request["requestingStatusId"] !== this._constants.REQUEST_STATUS_COMPLETED && request["requestingStatusId"] !== this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED && request["requestingStatusId"] !== this._constants.REQUEST_STATUS_NOT_COMPLETED))
				return "completedAwaitingApproval"
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

	getDirection() { return "incoming"; }

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

		this._requestsService.getIncomingRequestsForCurrentUser().then((data: Array<Object>) => {
			self.model = data;
			self.dirty = false;
			self.loading.dismiss();
		});
	};

	isRequestModelEmpty() {
		let rtn = this.model === undefined || this.model.length === 0;

		let len = 0;
		if (!rtn) {
			len = this.model.length;
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_ACCEPTED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_CANCELLED;
					});
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_PENDING && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_CANCELLED;
					});
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED;
					});
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_COMPLETED;
					});
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_RESOLVED_BUT_DISPUTED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED;
					});
			len -= this.getNumberOfMatchingElements((obj) => {
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED;
					});
			len -= this.getNumberOfMatchingElements((obj) => {
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED_AND_HIDDEN;
					});

			rtn = len <= 0;
		}

		return rtn;
	}

	getAcceptedRequests() {
		let self = this;
		let requests = this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_ACCEPTED);
		
		if (requests !== undefined) {
			let rtn = requests.filter((obj) => { return obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_CANCELLED; });
			return rtn.length > 0 ? rtn : undefined // there is a refactor to be had here.. this logic is used several times..
		}
		else
			return undefined;
	}

	getDeclinedRequests() {
		let self = this;
		let requests = this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_DECLINED);
		
		if (requests !== undefined) {
			let rtn = requests.filter((obj) => { return obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED; });
			return rtn.length > 0 ? rtn : undefined // there is a refactor to be had here.. this logic is used several times..
		}
		else
			return undefined;
	}

	getPendingRequests() {
		let rtn = this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_PENDING); 
		
		if (rtn) {
			rtn = rtn.filter((obj) => { return obj["requestingStatusId"] !== this._constants.REQUEST_STATUS_CANCELLED; });
		}

		if (rtn)
			return rtn.length > 0 ? rtn : undefined
		else
			return undefined;
	}

	getCompletedPendingApprovalRequests() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_NOT_COMPLETED; });
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

	getNumberOfMatchingElements(func) {
		if (this.model === undefined)
			return 0;

		let count = 0;
		this.model.map((obj) => { if (func(obj)) count++; });

		return count;
	}

	getThumbnailImage(offer) {
		if (offer["imageFileURI"] !== undefined && offer["imageOrientation"] !== undefined)
			return offer["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	getAvatarCSSClassString(offer) {
		return this._pictureService.getOrientationCSS(offer);
	}

	hasRequestMessage(req) {
		return (req["requestMessage"] !== undefined && req["requestMessage"] !== null && req["requestMessage"] !== '');
	}

	getRequestMessage(req) {
		return req["requestMessage"];
	}

	onViewContactInfoBtnTap(request) {
		this.navCtrl.push(ProfilePage, { user: request["directionallyOppositeUser"], readOnly: true });
	}

	onViewOffer(request) {
		this.navCtrl.push(OfferDisplayPage, { offer: request.offer });
	}

	onAcceptBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(AcceptRequestPage, {request: request});
		modal.onDidDismiss(data => { self.replaceModelElement(data) });
		modal.present();
	}

	onDeclineBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(DeclineRequestPage, {request: request});
		modal.onDidDismiss(data => { self.replaceModelElement(data) });
		modal.present();
	}

	onCancelBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(CancelRequestPage, {request: request});
		modal.onDidDismiss(data => { self.replaceModelElement(data) });
		modal.present();
	}

	onCompleteBtnTap(request) {
		let self = this;
		let modal = this.modalCtrl.create(CompleteRequestPage, {request: request});
		modal.onDidDismiss(data => { self.replaceModelElement(data) });
		modal.present();
	}

	onHideRequestBtnTap(request) {
		let self = this;
		this._requestsService.hideIncomingAndDeclinedRequest(request).then((data) => {
			self.replaceModelElement(data);
		});
	}
}
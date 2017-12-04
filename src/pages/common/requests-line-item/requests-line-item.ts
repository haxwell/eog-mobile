import { Component, Input } from '@angular/core';
import { ModalController, NavController, NavParams, Events } from 'ionic-angular';

import { AcceptRequestPage } from '../../../pages/requests/incoming/_pages/accept.request'
import { DeclineRequestPage } from '../../../pages/requests/incoming/_pages/decline.request'
import { CompleteRequestPage } from '../../../pages/requests/incoming/_pages/complete.request'
import { SecondCompleteRequestPage } from '../../../pages/requests/incoming/_pages/second.complete.request'
import { CancelRequestPage } from '../../../pages/requests/incoming/_pages/cancel.request'
import { ProfilePage } from '../../../pages/profile/profile'

import { PermanentlyDismissUnresolvedRequestPage } from '../../../pages/requests/outgoing/_pages/permanently-dismiss-unresolved-request'
import { NotCompleteOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/not.complete.request'
import { CompleteOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/complete.request'
import { CancelOutgoingRequestPage } from '../../../pages/requests/outgoing/_pages/cancel.request'

import { Constants } from '../../../_constants/constants'

import { ProfilePictureService } from '../../../app/_services/profile-picture.service'
import { ProfileService } from '../_services/profile.service'
import { RequestsService } from '../../../app/_services/requests.service'

@Component({
  selector: 'requests-line-item',
  templateUrl: 'requests-line-item.html'
})

export class RequestsLineItem {

	@Input() request = undefined;
	@Input() direction = undefined;

	directionallyOppositeUserProfileImageFilepath = undefined;

	constructor(navParams: NavParams, 
				private navCtrl: NavController,
				private modalCtrl: ModalController,
				private _constants: Constants,
				private _profilePictureService: ProfilePictureService,
				private _profileService: ProfileService,
				private _requestsService: RequestsService,
                _events: Events) {

		let func = (data) => {
			if (data["request"]["id"] === this.request["id"])
				this.request = data["request"];
		};

		_events.subscribe('request:saved', func);
		_events.subscribe('request:accepted', func);
		_events.subscribe('request:declined', func);
		_events.subscribe('request:completed', func);
		_events.subscribe('request:deleted', func);
		_events.subscribe('request:statusChanged', func);
	}

	ngOnInit() {
		let id = this.request["requestingUserId"];
		let path = this._profileService.getMostProbableProfilePhotoPath() + id;
		this._profilePictureService.get(id, path).then((path) => {
			this.directionallyOppositeUserProfileImageFilepath = path;
		});
	}

	ionViewWillEnter() {

	}

	onViewContactInfoBtnTap() {
		this.navCtrl.push(ProfilePage, { user: this.request["directionallyOppositeUser"], readOnly: true });
	}

	isRequestPending() {
		return this.direction === 'incoming' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_PENDING;
	}

	isRequestAccepted() {
		return this.direction === 'incoming' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_ACCEPTED;
	}

	isRequestDeclined() {
		return this.direction === 'incoming' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED;
	}

	isRequestCompletedPendingApproval() {
		return this.direction === 'incoming' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED 
			&& this.request["requestingStatusId"] !== this._constants.REQUEST_STATUS_COMPLETED 
			&& this.request["requestingStatusId"] !== this._constants.REQUEST_STATUS_NOT_COMPLETED;
	}

	isRequestDisputedCompleted() {
		return this.direction === 'incoming' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED 
			&& this.request["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED;	
	}

	isOutgoingRequestPending() {
		return this.direction === 'outgoing' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_PENDING;
	}

	isOutgoingRequestAccepted() {
		return this.direction === 'outgoing' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_ACCEPTED;
	}

	isOutgoingRequestCompletedAwaitingApproval() {
 		return this.direction === 'outgoing' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && (this.request["requestingStatusId"] !== this._constants.REQUEST_STATUS_COMPLETED && this.request["requestingStatusId"] !== this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED && this.request["requestingStatusId"] !== this._constants.REQUEST_STATUS_NOT_COMPLETED);
	}

	isOutgoingRequestNotCompleteAwaitingResolution() {
		return this.direction === 'outgoing' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && this["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED;
	}

	isOutgoingRequestCancelled() {
		return this.direction === 'outgoing' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED;
	}

	isOutgoingRequestDeclined() {
		return this.direction === 'outgoing' && this.request["deliveringStatusId"] === this._constants.REQUEST_STATUS_DECLINED; 
	}

	onTap() {
		console.log("tap!");
	}

	onLongPress() {
		this.navCtrl.push(ProfilePage, { user: this.request["directionallyOppositeUser"], readOnly: true });
	}

	onDeclineBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(DeclineRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onAcceptBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(AcceptRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCompleteBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(CompleteRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onSecondCompleteBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(SecondCompleteRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onUnableToCompleteBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(CancelRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onAcknowledgeBtnTap() {
		let self = this;
		self._requestsService.acknowledgeDeclinedRequest(self.request).then((data) => {

		});
	}

	onCompleteOutgoingBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(CompleteOutgoingRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onNotCompleteBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(NotCompleteOutgoingRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCancelBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(CancelOutgoingRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onPermanentlyDismissBtnTap() {
		let self = this;
		let modal = this.modalCtrl.create(PermanentlyDismissUnresolvedRequestPage, {request: this.request});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	getDOUserProfileImageFilepath() {
		return this.directionallyOppositeUserProfileImageFilepath;
	}

	isDOUserProfileImageAvailable() {
		return this.directionallyOppositeUserProfileImageFilepath !== undefined && this.directionallyOppositeUserProfileImageFilepath !== null;
	}
}
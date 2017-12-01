import { Component, Input } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';

import { AcceptRequestPage } from '../../../pages/requests/incoming/_pages/accept.request'
import { DeclineRequestPage } from '../../../pages/requests/incoming/_pages/decline.request'
import { CompleteRequestPage } from '../../../pages/requests/incoming/_pages/complete.request'
import { SecondCompleteRequestPage } from '../../../pages/requests/incoming/_pages/second.complete.request'
import { CancelRequestPage } from '../../../pages/requests/incoming/_pages/cancel.request'
import { ProfilePage } from '../../../pages/profile/profile'

import { Constants } from '../../../_constants/constants'

@Component({
  selector: 'requests-line-item',
  templateUrl: 'requests-line-item.html'
})

export class RequestsLineItem {

	@Input() request = undefined;
	@Input() direction = undefined;

	constructor(navParams: NavParams, 
				private navCtrl: NavController,
				private modalCtrl: ModalController,
				private _constants: Constants) {
		this.request = navParams.get('request') || undefined;
		this.direction = navParams.get('direction') || undefined;
	}

	ngOnInit() {

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

	onDeclineBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(DeclineRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onAcceptBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(AcceptRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onCompleteBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(CompleteRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onSecondCompleteBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(SecondCompleteRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}

	onUnableToCompleteBtnTap(item) {
		let self = this;
		let modal = this.modalCtrl.create(CancelRequestPage, {request: item});
		modal.onDidDismiss(data => { self.ngOnInit() });
		modal.present();
	}
}
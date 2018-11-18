import { Component } from '@angular/core';

import { NavController, NavParams, ViewController, Events } from 'ionic-angular';

import { OfferModelService } 	from '../../../app/_services/offer-model.service';
import { RequestsService } 	from '../../../app/_services/requests.service';
import { RequestMetadataService } 	from '../../../app/_services/request-metadata.service';

import { Constants } from '../../../_constants/constants';

@Component({
  selector: 'page-offer-detail-delete',
  templateUrl: 'delete.offer.html'
})
export class DeleteOfferPage {

	offer = undefined;
	offerRequests = undefined;
	offerRequestsInProgress = undefined;
	offerRequestsNotInProgress = undefined;
	isInitialized = false;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _offerModelService: OfferModelService,
				private _requestsService: RequestsService,
				private _requestMetadataService: RequestMetadataService,
				private _events: Events,
				private _constants: Constants
				) {
		this.offer = params.get('offer');
	}

	ngOnInit() {
		let self = this;

		self._requestMetadataService.init();

		// get all the requests
		this._requestsService.getIncomingRequestsForCurrentUser().then((model: Array<Object>) => {
			// then, for all that are for this offer
			self.offerRequests = model.filter((obj) => {
				return obj["offer"]["id"] === self.offer["id"]; });

			// sort them according to whether they are in progress
			self.offerRequests.forEach((request) => {
				self._requestMetadataService.getMetadataValue(request, self._constants.FUNCTION_KEY_REQUEST_IS_IN_PROGRESS).then((bool) => {
					if (bool) {
						if (self.offerRequestsInProgress === undefined)
							self.offerRequestsInProgress = [];

						self.offerRequestsInProgress.push(request);
					}
					else {
						if (self.offerRequestsNotInProgress === undefined)
							self.offerRequestsNotInProgress = [];

						self.offerRequestsNotInProgress.push(request);
					}
				})
			});

			self.isInitialized = true;
		});
	}

	getOfferRequestsNotInProgress() {
		return this.offerRequestsNotInProgress;
	}

	getOfferRequestsInProgress() {
		return this.offerRequestsInProgress;
	}

	isOfferAttachedToARequestNotInProgress() {
		return this.offerRequestsNotInProgress && this.offerRequestsNotInProgress.length > 0;
	}

	isOfferAttachedToAnInProgressRequest() {
		return this.offerRequestsInProgress && this.offerRequestsInProgress.length > 0;
	}

	isDeleteBtnEnabled() {
		return this.isInitialized && !this.isOfferAttachedToAnInProgressRequest();
	}

	onDeleteBtnTap(evt) {
		let self = this;
		self._offerModelService.delete(self.offer).then(() => {
			self._events.publish('offer:deletedByCurrentUser', self.offer);
			self.viewCtrl.dismiss(true);
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

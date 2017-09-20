import { Component } from '@angular/core';

import { NavController, NavParams, ViewController, Events } from 'ionic-angular';

import { PrmService } 	from '../_services/prm.service';
import { RequestsService } 	from '../../../app/_services/requests.service';
import { RequestQualityService } 	from '../../../app/_services/request-quality.service';

import { Constants } from '../../../_constants/constants';

@Component({
  selector: 'page-prm-detail-delete',
  templateUrl: 'delete.prm.html'
})
export class DeletePrmPage {

	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_COMPLETED = 4;
	REQUEST_STATUS_CANCELLED = 5;	
	REQUEST_STATUS_NOT_COMPLETED = 6;		

	prm = undefined;
	prmRequests = undefined;
	prmRequestsInProgress = undefined;
	prmRequestsNotInProgress = undefined;
	isInitialized = false;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _prmService: PrmService,
				private _requestsService: RequestsService,
				private _requestQualityService: RequestQualityService,
				private _events: Events,
				private _constants: Constants
				) {
		this.prm = params.get('prm');
	}

	ngOnInit() {
		let self = this;

		self._requestQualityService.init();

		// get all the requests
		this._requestsService.getModelForIncoming().then((model: Array<Object>) => {
			// then, for all that are for this prm
			self.prmRequests = model.filter((obj) => {
				return obj["prm"]["id"] === self.prm["id"]; });

			// sort them according to whether they are in progress
			self.prmRequests.forEach((request) => {
				if (self._requestQualityService.getQualityValue(request, self._constants.FUNCTION_KEY_REQUEST_IS_IN_PROGRESS)) {
					if (self.prmRequestsInProgress === undefined)
						self.prmRequestsInProgress = [];

					self.prmRequestsInProgress.push(request);
				}
				else {
					if (self.prmRequestsNotInProgress === undefined)
						self.prmRequestsNotInProgress = [];

					self.prmRequestsNotInProgress.push(request);
				}

			});

			self.isInitialized = true;
		});
	}

	getPrmRequestsNotInProgress() {
		return this.prmRequestsNotInProgress;
	}

	getPrmRequestsInProgress() {
		return this.prmRequestsInProgress;
	}

	isPrmAttachedToARequestNotInProgress() {
		return this.prmRequestsNotInProgress && this.prmRequestsNotInProgress.length > 0;
	}

	isPrmAttachedToAnInProgressRequest() {
		return this.prmRequestsInProgress && this.prmRequestsInProgress.length > 0;
	}

	isDeleteBtnEnabled() {
		return this.isInitialized && !this.isPrmAttachedToAnInProgressRequest();
	}

	onDeleteBtnTap(evt) {
		let self = this;
		self._prmService.delete(self.prm).then(() => {
			self._events.publish('prm:deleted', self.prm);
			self.viewCtrl.dismiss(true);
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

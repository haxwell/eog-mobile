import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { DreamService } 	from '../../../app/_services/dream.service';
import { RequestsService } 	from '../../../app/_services/requests.service';

@Component({
  selector: 'page-dream-detail-delete',
  templateUrl: 'delete.dream.html'
})
export class DeleteDreamPage {

	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_COMPLETED = 4;
	REQUEST_STATUS_CANCELLED = 5;	
	REQUEST_STATUS_NOT_COMPLETED = 6;		

	dream = undefined;
	dreamRequests = undefined;
	dreamRequestsInProgress = undefined;
	dreamRequestsNotInProgress = undefined;
	isInitialized = false;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _dreamService: DreamService,
				private _requestsService: RequestsService) {
		this.dream = params.get('dream');
	}

	ngOnInit() {
		let self = this;

		this._requestsService.getModelForOutgoing().then((model: Array<Object>) => {
			// get all the requests for this dream
			self.dreamRequests = model.filter((obj) => {
				return obj["dream"]["id"] === self.dream["id"]; });

			// create another list with all the requests for this dream that are in progress
			self.dreamRequestsInProgress = self.dreamRequests.filter((obj) => { 
				return obj["deliveringStatusId"] === self.REQUEST_STATUS_ACCEPTED; });

			// a third list for all the requests for this dream that are not in progress
			self.dreamRequestsNotInProgress = self.dreamRequests.filter((obj) => {
				return self.dreamRequestsInProgress.some((obj2) => { return obj2["id"] !== obj["id"]; }); 
			});

			self.isInitialized = true;
		});
	}

	getDreamRequestsNotInProgress() {
		return this.dreamRequestsNotInProgress;
	}

	getDreamRequestsInProgress() {
		return this.dreamRequestsInProgress;
	}

	isDreamAttachedToARequestNotInProgress() {
		return this.dreamRequestsNotInProgress && this.dreamRequestsNotInProgress.length > 0;
	}

	isDreamAttachedToAnInProgressRequest() {
		return this.dreamRequestsInProgress && this.dreamRequestsInProgress.length > 0;
	}

	isDeleteBtnEnabled() {
		return this.isInitialized && !this.isDreamAttachedToAnInProgressRequest();
	}

	onDeleteBtnTap(evt) {
		this._dreamService.delete(this.dream).then(() => {
			this.viewCtrl.dismiss(true);
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

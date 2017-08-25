import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { ThingService } 	from '../_services/thing.service';
import { RequestsService } 	from '../../../app/_services/requests.service';

@Component({
  selector: 'page-thing-detail-delete',
  templateUrl: 'delete.thing.html'
})
export class DeleteThingPage {

	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_COMPLETED = 4;
	REQUEST_STATUS_CANCELLED = 5;	
	REQUEST_STATUS_NOT_COMPLETED = 6;		

	thing = undefined;
	thingRequests = undefined;
	thingRequestsInProgress = undefined;
	thingRequestsNotInProgress = undefined;
	isInitialized = false;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _thingService: ThingService,
				private _requestsService: RequestsService) {
		this.thing = params.get('thing');
	}

	ngOnInit() {
		let self = this;

		this._requestsService.getModelForIncoming().then((model: Array<Object>) => {
			// get all the requests for this thing
			self.thingRequests = model.filter((obj) => {
				return obj["thing"]["id"] === self.thing["id"]; });

			// create another list with all the requests for this thing that are in progress
			self.thingRequestsInProgress = self.thingRequests.filter((obj) => { 
				return obj["deliveringStatusId"] === self.REQUEST_STATUS_ACCEPTED; });

			// a third list for all the requests for this thing that are not in progress
			self.thingRequestsNotInProgress = self.thingRequests.filter((obj) => {
				return self.thingRequestsInProgress.some((obj2) => { return obj2["id"] !== obj["id"]; }); 
			});

			self.isInitialized = true;
		});
	}

	getThingRequestsNotInProgress() {
		return this.thingRequestsNotInProgress;
	}

	getThingRequestsInProgress() {
		return this.thingRequestsInProgress;
	}

	isThingAttachedToARequestNotInProgress() {
		return this.thingRequestsNotInProgress && this.thingRequestsNotInProgress.length > 0;
	}

	isThingAttachedToAnInProgressRequest() {
		return this.thingRequestsInProgress && this.thingRequestsInProgress.length > 0;
	}

	isDeleteBtnEnabled() {
		return this.isInitialized && !this.isThingAttachedToAnInProgressRequest();
	}

	onDeleteBtnTap(evt) {
		this._thingService.delete(this.thing).then(() => {
			this.viewCtrl.dismiss(true);
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}

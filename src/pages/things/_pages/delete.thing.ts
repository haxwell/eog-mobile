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
			self.thingRequests = model.filter((obj) => {
				return obj["thing"]["id"] === self.thing["id"]; });

			self.thingRequestsInProgress = self.thingRequests.filter((obj) => { 
				return obj["deliveringStatusId"] === self.REQUEST_STATUS_ACCEPTED; });
		});
	}

	getThingRequests() {
		return this.thingRequests;
	}

	getThingRequestsInProgress() {
		return this.thingRequestsInProgress;
	}

	isThingAttachedToARequest() {
		return this.thingRequests && this.thingRequests.length > 0;
	}

	isThingAttachedToAnInProgressRequest() {
		return this.thingRequestsInProgress && this.thingRequestsInProgress.length > 0;
	}

	isDeleteBtnEnabled() {
		return !this.isThingAttachedToAnInProgressRequest();
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
